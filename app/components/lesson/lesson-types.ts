import type { LessonProgressStatus, QuestionType } from "~/db/schema";

export type LessonLink = { id: number; title: string };
export type CourseSummary = { id: number; title: string; slug: string };
export type Curriculum = Array<{
  id: number;
  title: string;
  lessons: LessonLink[];
}>;
export type Quiz = {
  id: number;
  title: string;
  passingScore: number;
  questions: Array<{
    id: number;
    questionText: string;
    questionType: QuestionType;
    position: number;
    options: Array<{ id: number; optionText: string }>;
  }>;
};
export type LessonProgressMap = Record<number, LessonProgressStatus>;
