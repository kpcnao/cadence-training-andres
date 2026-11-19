import { beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, seedBaseData, type TestDb } from "~/test/setup";
import {
  comments,
  lessonProgress,
  lessons,
  modules,
  QuestionType,
  quizAnswers,
  quizAttempts,
  quizOptions,
  quizQuestions,
  quizzes,
  LessonProgressStatus,
} from "~/db/schema";
import { markdown } from "~/lib/text";
import {
  computeResult,
  getLessonThread,
  getQuizById,
  getQuizWithQuestions,
  markLessonComplete,
  markLessonInProgress,
} from "../queries.server";

const database = vi.hoisted(() => ({
  current: undefined as unknown as TestDb,
}));
vi.mock("~/db", () => ({
  get db() {
    return database.current;
  },
}));

const NOW = new Date("2026-11-19T12:00:00.000Z");
let db: TestDb;
let userId: number;
let lessonId: number;

beforeEach(() => {
  db = createTestDb();
  database.current = db;
  const base = seedBaseData(db);
  userId = base.user.id;
  const mod = db
    .insert(modules)
    .values({ courseId: base.course.id, title: "Basics", position: 1 })
    .returning()
    .get();
  lessonId = db
    .insert(lessons)
    .values({ moduleId: mod.id, title: "Lesson", position: 1 })
    .returning()
    .get().id;
});

function addQuiz() {
  const quiz = db
    .insert(quizzes)
    .values({ lessonId, title: "Quiz", passingScore: 0.7 })
    .returning()
    .get();
  const questions = [1, 2, 3].map((position) => {
    const question = db
      .insert(quizQuestions)
      .values({
        quizId: quiz.id,
        questionText: `Question ${position}`,
        questionType: QuestionType.MultipleChoice,
        position,
      })
      .returning()
      .get();
    const options = [true, false].map((isCorrect) =>
      db
        .insert(quizOptions)
        .values({
          questionId: question.id,
          optionText: isCorrect ? "Correct" : "Incorrect",
          isCorrect,
        })
        .returning()
        .get()
    );
    return { ...question, correctOptionId: options[0].id };
  });
  return { quiz, questions };
}

describe("lesson progress", () => {
  it("uses the supplied completion time for inserts and updates", () => {
    const first = markLessonComplete(userId, lessonId, NOW);
    expect(first).toMatchObject({
      status: LessonProgressStatus.Completed,
      completedAt: NOW.toISOString(),
    });

    const later = new Date(NOW.getTime() + 60_000);
    const updated = markLessonComplete(userId, lessonId, later);
    expect(updated).toMatchObject({
      id: first.id,
      completedAt: later.toISOString(),
    });
    expect(db.select().from(lessonProgress).all()).toHaveLength(1);
  });

  it("starts progress without replacing a completed status", () => {
    const started = markLessonInProgress(userId, lessonId);
    expect(started.status).toBe(LessonProgressStatus.InProgress);

    markLessonComplete(userId, lessonId, NOW);
    const completed = markLessonInProgress(userId, lessonId);
    expect(completed.status).toBe(LessonProgressStatus.Completed);
    expect(completed.completedAt).toBe(NOW.toISOString());
  });
});

describe("quizzes", () => {
  it("loads each question with its options without per-question queries", () => {
    const { quiz } = addQuiz();
    expect(getQuizById(quiz.id)?.lessonId).toBe(lessonId);
    const select = vi.spyOn(db, "select");

    const result = getQuizWithQuestions(quiz.id);

    expect(result?.questions).toHaveLength(3);
    expect(
      result?.questions.map((question) => question.options.length)
    ).toEqual([2, 2, 2]);
    expect(select).toHaveBeenCalledTimes(2);
  });

  it("keeps questions that have no options", () => {
    const { quiz, questions } = addQuiz();
    db.delete(quizOptions)
      .where(eq(quizOptions.questionId, questions[0].id))
      .run();

    const result = getQuizWithQuestions(quiz.id);

    expect(result?.questions[0].options).toEqual([]);
    expect(result?.questions[1].options).toHaveLength(2);
  });

  it("grades selected answers and saves the attempt with its answers", () => {
    const { quiz, questions } = addQuiz();
    const selectedAnswers = Object.fromEntries(
      questions.map((question) => [question.id, question.correctOptionId])
    );

    const result = computeResult(userId, quiz.id, selectedAnswers);

    expect(result).toMatchObject({
      score: 1,
      passed: true,
      grade: "A",
      totalCorrect: 3,
      totalQuestions: 3,
    });
    expect(db.select().from(quizAttempts).all()).toHaveLength(1);
    expect(db.select().from(quizAnswers).all()).toHaveLength(3);
  });

  it("reports a missing correct option without failing the attempt", () => {
    const { quiz, questions } = addQuiz();
    db.update(quizOptions)
      .set({ isCorrect: false })
      .where(eq(quizOptions.questionId, questions[0].id))
      .run();
    const selectedAnswers = Object.fromEntries(
      questions.map((question) => [question.id, question.correctOptionId])
    );

    const result = computeResult(userId, quiz.id, selectedAnswers);

    expect(result?.questionResults[0]).toEqual({
      questionId: questions[0].id,
      correct: false,
      selectedOptionId: questions[0].correctOptionId,
      correctOptionId: null,
    });
    expect(result?.totalCorrect).toBe(2);
  });

  it("saves an unanswered attempt without answer rows", () => {
    const { quiz } = addQuiz();

    const result = computeResult(userId, quiz.id, {});

    expect(result).toMatchObject({
      score: 0,
      passed: false,
      totalCorrect: 0,
      totalQuestions: 3,
    });
    expect(db.select().from(quizAttempts).all()).toHaveLength(1);
    expect(db.select().from(quizAnswers).all()).toHaveLength(0);
  });

  it("rolls back the attempt when an answer cannot be saved", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { quiz, questions } = addQuiz();
    const selectedAnswers = Object.fromEntries(
      questions.map((question) => [question.id, question.correctOptionId])
    );
    selectedAnswers[questions[0].id] = 999_999;

    expect(computeResult(userId, quiz.id, selectedAnswers)).toBeNull();
    expect(db.select().from(quizAttempts).all()).toHaveLength(0);
    expect(db.select().from(quizAnswers).all()).toHaveLength(0);
  });
});

describe("discussion", () => {
  it("does not query comment rows when there are no threads", () => {
    const select = vi.spyOn(db, "select");

    expect(getLessonThread(lessonId)).toEqual([]);
    expect(select).toHaveBeenCalledTimes(2);
  });

  it("loads the latest bounded threads and their replies", () => {
    const topLevel = [1, 2, 3].map((position) =>
      db
        .insert(comments)
        .values({
          lessonId,
          userId,
          body: markdown(`Question ${position}`),
          createdAt: new Date(NOW.getTime() + position * 1000).toISOString(),
        })
        .returning()
        .get()
    );
    const reply = db
      .insert(comments)
      .values({
        lessonId,
        userId,
        parentId: topLevel[2].id,
        body: markdown("Latest reply"),
        createdAt: new Date(NOW.getTime() + 4000).toISOString(),
      })
      .returning()
      .get();
    db.insert(comments)
      .values({
        lessonId,
        userId,
        parentId: topLevel[0].id,
        body: markdown("Excluded reply"),
        createdAt: new Date(NOW.getTime() + 5000).toISOString(),
      })
      .run();

    const thread = getLessonThread(lessonId, 2);

    expect(thread.map((comment) => comment.id)).toEqual([
      topLevel[1].id,
      topLevel[2].id,
    ]);
    expect(thread[1].replies.map((comment) => comment.id)).toEqual([reply.id]);
  });
});
