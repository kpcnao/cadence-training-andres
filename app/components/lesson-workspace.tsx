import { MessageSquare, NotebookPen } from "lucide-react";
import { CommentThread, type RenderedComment } from "./comment-thread";
import { LessonNote } from "./lesson-note";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

function WorkspaceTabs({
  currentUserId,
  commentCount,
}: {
  currentUserId: number | null;
  commentCount: number;
}) {
  return (
    <TabsList
      aria-label="Lesson sections"
      className="h-auto w-full justify-start gap-6 rounded-none border-b bg-muted/30 px-5 py-0 sm:px-6"
    >
      {currentUserId && (
        <TabsTrigger
          value="notes"
          className="-mb-px gap-2 rounded-none border-b-2 border-transparent px-0 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          <NotebookPen />
          Your notes
        </TabsTrigger>
      )}
      <TabsTrigger
        value="discussion"
        className="-mb-px gap-2 rounded-none border-b-2 border-transparent px-0 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
      >
        <MessageSquare />
        Discussion
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {commentCount}
        </span>
      </TabsTrigger>
    </TabsList>
  );
}

function NotesPanel({
  note,
}: {
  note: { body: string; updatedAt: string } | null;
}) {
  return (
    <TabsContent
      value="notes"
      forceMount
      className="p-5 data-[state=inactive]:hidden sm:p-6"
    >
      <LessonNote note={note} />
    </TabsContent>
  );
}

export function LessonWorkspace({
  note,
  comments,
  currentUserId,
  canModerate,
  instructorName,
}: {
  note: { body: string; updatedAt: string } | null;
  comments: RenderedComment[];
  currentUserId: number | null;
  canModerate: boolean;
  instructorName: string;
}) {
  return (
    <section
      aria-labelledby="lesson-workspace-title"
      className="mb-8 overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <h2 id="lesson-workspace-title" className="sr-only">
        Lesson workspace
      </h2>
      <Tabs defaultValue={currentUserId ? "notes" : "discussion"}>
        <WorkspaceTabs
          currentUserId={currentUserId}
          commentCount={comments.length}
        />

        {currentUserId && <NotesPanel note={note} />}
        <TabsContent
          value="discussion"
          forceMount
          className="p-5 data-[state=inactive]:hidden sm:p-6"
        >
          <CommentThread
            comments={comments}
            currentUserId={currentUserId}
            canModerate={canModerate}
            canPost
            instructorName={instructorName}
            embedded
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
