import { useState } from "react";
import { useFetcher } from "react-router";
import { Check, Lock, NotebookPen } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { MAX_NOTE_LENGTH } from "~/lib/notes";
import { formatRelativeTime } from "~/lib/utils";

function NoteHeader() {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <NotebookPen className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">Your notes</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            <Lock className="size-3" />
            Private to you
          </span>
        </div>
        <p
          id="lesson-note-privacy"
          className="mt-1 text-sm text-muted-foreground"
        >
          Only you can see these notes. Capture what you want to remember from
          this lesson.
        </p>
      </div>
    </div>
  );
}

function NoteStatus({
  error,
  isSaving,
  hasChanges,
  hasSavedNote,
  note,
}: {
  error: string | undefined;
  isSaving: boolean;
  hasChanges: boolean;
  hasSavedNote: boolean;
  note: { body: string; updatedAt: string } | null;
}) {
  if (error && !isSaving) {
    return (
      <span role="alert" className="text-sm text-destructive">
        {error}
      </span>
    );
  }

  if (hasChanges || !hasSavedNote) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Check className="size-3.5 text-green-600" />
      All changes saved
      {note && (
        <span suppressHydrationWarning className="hidden sm:inline">
          · Last edited {formatRelativeTime(note.updatedAt)}
        </span>
      )}
    </span>
  );
}

function NoteFooter({
  characterCount,
  disabled,
  error,
  isSaving,
  hasChanges,
  hasSavedNote,
  note,
}: {
  characterCount: number;
  disabled: boolean;
  error: string | undefined;
  isSaving: boolean;
  hasChanges: boolean;
  hasSavedNote: boolean;
  note: { body: string; updatedAt: string } | null;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <span id="lesson-note-count" className="text-xs text-muted-foreground">
        {characterCount.toLocaleString("en")} /{" "}
        {MAX_NOTE_LENGTH.toLocaleString("en")}
      </span>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <NoteStatus
          error={error}
          isSaving={isSaving}
          hasChanges={hasChanges}
          hasSavedNote={hasSavedNote}
          note={note}
        />
        <Button type="submit" size="sm" disabled={disabled}>
          {isSaving ? "Saving…" : "Save note"}
        </Button>
      </div>
    </div>
  );
}

export function LessonNote({
  note,
}: {
  note: { body: string; updatedAt: string } | null;
}) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [body, setBody] = useState(note?.body ?? "");
  const isSaving = fetcher.state !== "idle";
  const error = fetcher.data?.error;
  const hasChanges = body.trim() !== (note?.body ?? "");
  const hasSavedNote = Boolean(note || fetcher.data?.ok);

  return (
    <div>
      <NoteHeader />

      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="save-note" />
        <label htmlFor="lesson-note-body" className="sr-only">
          Your private notes for this lesson
        </label>
        <Textarea
          id="lesson-note-body"
          name="body"
          rows={5}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={MAX_NOTE_LENGTH}
          aria-describedby="lesson-note-privacy lesson-note-count"
          placeholder="Capture an idea, a question, or something to revisit…"
          className="min-h-36 resize-y border-border/70 bg-muted/30 p-4 text-sm leading-6 shadow-none focus-visible:bg-background"
        />

        <NoteFooter
          characterCount={body.length}
          disabled={isSaving || !body.trim() || !hasChanges}
          error={error}
          isSaving={isSaving}
          hasChanges={hasChanges}
          hasSavedNote={hasSavedNote}
          note={note}
        />
      </fetcher.Form>
    </div>
  );
}
