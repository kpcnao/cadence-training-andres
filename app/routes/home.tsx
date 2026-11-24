import { Link } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { CourseStatus } from "~/db/schema";
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  GraduationCap,
  Moon,
  Sun,
  User,
  Users,
} from "lucide-react";
import { CourseImage } from "~/components/course-image";
import { LearningPreview } from "~/components/learning-preview";
import { DevUI } from "~/components/dev-ui";
import { getCurrentUserId, getDevCountry } from "~/lib/session";
import { getCountryTierInfo, COUNTRIES } from "~/lib/ppp";
import { eq, like, and, or, sql } from "drizzle-orm";
import { db } from "~/db";
import { courses, categories, users, modules, lessons } from "~/db/schema";

function getAllUsers() {
  return db.select().from(users).all();
}

function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

function getAllCategories() {
  return db.select().from(categories).orderBy(categories.name).all();
}

function buildCourseQuery(
  search: string | null,
  category: string | null,
  status: CourseStatus | null,
  sortBy: string | null,
  limit: number,
  offset: number
) {
  const conditions = [];

  if (status) {
    conditions.push(eq(courses.status, status));
  }

  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(like(courses.title, term), like(courses.description, term))
    );
  }

  const query = db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      salesCopy: courses.salesCopy,
      instructorId: courses.instructorId,
      categoryId: courses.categoryId,
      status: courses.status,
      coverImageUrl: courses.coverImageUrl,
      price: courses.price,
      pppEnabled: courses.pppEnabled,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      instructorName: users.name,
      instructorAvatarUrl: users.avatarUrl,
      categoryName: categories.name,
    })
    .from(courses)
    .innerJoin(users, eq(courses.instructorId, users.id))
    .innerJoin(categories, eq(courses.categoryId, categories.id));

  if (category) {
    conditions.push(eq(categories.slug, category));
  }

  const filtered =
    conditions.length > 0 ? query.where(and(...conditions)) : query;

  const sorted =
    sortBy === "title"
      ? filtered.orderBy(courses.title)
      : sortBy === "oldest"
        ? filtered.orderBy(courses.createdAt)
        : filtered.orderBy(sql`${courses.createdAt} DESC`);

  return sorted.limit(limit).offset(offset).all();
}

function getLessonCountForCourse(courseId: number) {
  const courseModules = db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.courseId, courseId))
    .all();

  if (courseModules.length === 0) return 0;

  const count = db
    .select({ count: sql<number>`count(*)` })
    .from(lessons)
    .where(or(...courseModules.map((m) => eq(lessons.moduleId, m.id))))
    .get();

  return count?.count ?? 0;
}

export function meta() {
  return [
    { title: "Cadence — Learn at your own pace" },
    {
      name: "description",
      content:
        "A modern course platform for developers. Browse courses, track your progress, and learn at your own pace.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const courses = buildCourseQuery(
    null,
    null,
    CourseStatus.Published,
    "newest",
    50,
    0
  );
  const featured = courses.slice(0, 3).map((course) => ({
    ...course,
    lessonCount: getLessonCountForCourse(course.id),
  }));
  const categories = getAllCategories();
  const users = getAllUsers();
  const currentUserId = await getCurrentUserId(request);
  const currentUser = currentUserId ? getUserById(currentUserId) : null;
  const devCountry = await getDevCountry(request);
  const countryTierInfo = getCountryTierInfo(devCountry);

  return {
    featuredCourses: featured,
    totalCourses: courses.length,
    totalCategories: categories.length,
    users: users.map((u) => ({ id: u.id, name: u.name, role: u.role })),
    currentUser: currentUser
      ? { id: currentUser.id, name: currentUser.name, role: currentUser.role }
      : null,
    devCountry,
    countryTierInfo,
    countries: COUNTRIES,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    featuredCourses,
    totalCourses,
    totalCategories,
    users,
    currentUser,
    devCountry,
    countryTierInfo,
    countries,
  } = loaderData;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("cadence-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            aria-label="Cadence home"
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
              <Code2 className="size-4" aria-hidden="true" />
            </span>
            Cadence
          </Link>
          <nav
            aria-label="Primary"
            className="flex items-center gap-1 sm:gap-4"
          >
            <Link
              to="/courses"
              className="hidden rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground min-[360px]:block"
            >
              Courses
            </Link>
            <button
              onClick={toggleDarkMode}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
            {currentUser ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Log In
                </Link>
                <Button asChild size="sm">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="overflow-hidden bg-gradient-to-br from-emerald-50/80 via-background to-background dark:from-emerald-950/30">
          <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
            <div className="text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-800 uppercase dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Learning that fits your life
              </p>
              <h1 className="mt-6 max-w-xl text-5xl leading-[1.04] font-bold tracking-[-0.045em] sm:text-6xl lg:text-[4.25rem]">
                Learn to code,
                <span className="mt-1 block text-emerald-600 dark:text-emerald-400">
                  at your own pace.
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
                Structured courses built by experienced instructors. Track your
                progress, take quizzes, and build real-world skills.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-12 rounded-full px-6">
                  <Link to="/courses">
                    Browse Courses
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full px-6"
                >
                  <Link to={currentUser ? "/dashboard" : "/signup"}>
                    {currentUser ? "Continue learning" : "Start learning"}
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {["Expert-led", "Hands-on", "Self-paced"].map((benefit) => (
                  <span key={benefit} className="flex items-center gap-1.5">
                    <Check
                      className="size-4 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <LearningPreview />
          </div>
        </section>

        <section
          aria-label="Cadence at a glance"
          className="border-y border-border bg-muted/30"
        >
          <dl className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 text-left sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <BookOpen className="size-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col-reverse">
                <dt className="text-sm text-muted-foreground">
                  Available courses
                </dt>
                <dd className="text-2xl font-bold tracking-tight">
                  {totalCourses}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:border-l sm:border-border sm:pl-8">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <GraduationCap className="size-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col-reverse">
                <dt className="text-sm text-muted-foreground">
                  Categories to explore
                </dt>
                <dd className="text-2xl font-bold tracking-tight">
                  {totalCategories}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:border-l sm:border-border sm:pl-8">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <Users className="size-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col-reverse">
                <dt className="text-sm text-muted-foreground">
                  Learn on your schedule
                </dt>
                <dd className="text-2xl font-bold tracking-tight">
                  Self-paced
                </dd>
              </div>
            </div>
          </dl>
        </section>

        {featuredCourses.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="text-left">
                <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-400">
                  Pick your next skill
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Featured courses
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Start learning with our most popular courses.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="self-start sm:self-auto"
              >
                <Link to="/courses">
                  View all courses
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  <Card className="h-full gap-4 overflow-hidden pt-0 pb-5 transition duration-300 group-hover:-translate-y-1 group-hover:border-foreground/20 group-hover:shadow-lg">
                    <CourseImage
                      src={course.coverImageUrl}
                      alt={course.title}
                      className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                    <CardHeader className="gap-2">
                      <p className="text-[11px] font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                        {course.categoryName}
                      </p>
                      <h3 className="text-lg leading-snug font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {course.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {course.description}
                      </p>
                    </CardContent>
                    <CardFooter className="mt-auto flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <User
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {course.instructorName ?? "Instructor"}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <BookOpen className="size-3.5" aria-hidden="true" />
                        {course.lessonCount} lessons
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 text-left sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold text-foreground"
            >
              <Code2
                className="size-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              Cadence
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Focused learning. Lasting skills.
            </p>
          </div>
          <Link
            to="/courses"
            className="flex items-center gap-2 self-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:self-auto"
          >
            Find your next course
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </footer>

      <DevUI
        users={users}
        currentUser={currentUser}
        devCountry={devCountry}
        countryTierInfo={countryTierInfo}
        countries={countries}
      />
    </div>
  );
}
