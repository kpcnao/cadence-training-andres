import type { ReactNode } from "react";
import { CheckCircle2, Clock3, Play } from "lucide-react";
import { cn } from "~/lib/utils";

const steps: {
  icon: ReactNode;
  title: string;
  description: string;
  detail: string;
  active: boolean;
}[] = [
  {
    icon: (
      <CheckCircle2
        className="size-5 shrink-0 text-emerald-400"
        aria-hidden="true"
      />
    ),
    title: "Watch a focused lesson",
    description: "Clear guidance, without the noise",
    detail: "12 min",
    active: false,
  },
  {
    icon: (
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-400 text-zinc-950">
        <Play className="ml-0.5 size-3.5 fill-current" aria-hidden="true" />
      </span>
    ),
    title: "Build something real",
    description: "Practice turns knowledge into skill",
    detail: "Next",
    active: true,
  },
  {
    icon: (
      <span className="grid size-5 shrink-0 place-items-center rounded-full border border-zinc-600 font-mono text-[10px] text-zinc-400">
        3
      </span>
    ),
    title: "Test your knowledge",
    description: "Quizzes that make learning stick",
    detail: "Quiz",
    active: false,
  },
];

function PreviewSteps() {
  return (
    <div className="mt-7 space-y-3">
      {steps.map((step) => (
        <div
          key={step.title}
          className={cn(
            "flex items-center gap-4 rounded-xl border p-4",
            step.active
              ? "border-emerald-400/30 bg-emerald-400/10"
              : "border-white/10 bg-white/5"
          )}
        >
          {step.icon}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{step.title}</p>
            <p
              className={cn(
                "mt-0.5 text-xs",
                step.active ? "text-emerald-100/60" : "text-zinc-400"
              )}
            >
              {step.description}
            </p>
          </div>
          <span
            className={cn(
              "font-mono text-xs",
              step.active ? "text-emerald-300" : "text-zinc-500"
            )}
          >
            {step.detail}
          </span>
        </div>
      ))}
    </div>
  );
}

function PreviewProgress() {
  return (
    <div className="mt-7">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">Progress you can see</span>
        <span className="font-medium text-emerald-400">Keep your rhythm</span>
      </div>
      <div
        aria-hidden="true"
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <div className="h-full w-2/3 rounded-full bg-emerald-400" />
      </div>
    </div>
  );
}

function SelfPacedBadge() {
  return (
    <div className="absolute -right-3 -bottom-12 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:-right-6">
      <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
        <Clock3 className="size-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold">Self-paced by design</p>
        <p className="text-xs text-muted-foreground">
          Your schedule. Your goals.
        </p>
      </div>
    </div>
  );
}

export function LearningPreview() {
  return (
    <figure
      aria-label="A preview of the Cadence learning experience"
      className="relative mx-auto mb-12 w-full max-w-lg lg:mx-0 lg:mb-0"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-800/20"
      />
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl shadow-emerald-950/20">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-zinc-700" />
            <span className="size-2.5 rounded-full bg-zinc-700" />
            <span className="size-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="font-mono text-[11px] tracking-wider text-zinc-400 uppercase">
            A look inside Cadence
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <p className="font-mono text-xs text-emerald-400">
            // Your learning path
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">
            Small steps.
            <span className="block text-zinc-400">Real momentum.</span>
          </p>
          <PreviewSteps />
          <PreviewProgress />
        </div>
      </div>
      <SelfPacedBadge />
    </figure>
  );
}
