// THROWAWAY PROTOTYPE: three inbox structures at /prototype/notifications?variant=A|B|C.
// In-memory fixtures only; no provider, persistence, or production wiring.
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Circle,
  Inbox,
  MessageSquare,
  Receipt,
  UsersRound,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type Kind = "discussion" | "seat" | "refund";
type Notice = {
  id: number;
  kind: Kind;
  title: string;
  detail: string;
  time: string;
  course: string;
  unread: boolean;
  to: string;
};

const initialNotices: Notice[] = [
  {
    id: 1,
    kind: "discussion",
    title: "Maya replied to your Discussion Question",
    detail: "“That explanation about closures finally clicked.”",
    time: "8 min ago",
    course: "Advanced TypeScript",
    unread: true,
    to: "/courses/advanced-typescript",
  },
  {
    id: 2,
    kind: "seat",
    title: "Noah claimed a Seat",
    detail: "4 Unclaimed Seats remain on your Team Licence.",
    time: "32 min ago",
    course: "TypeScript Foundations",
    unread: true,
    to: "/team",
  },
  {
    id: 3,
    kind: "refund",
    title: "Your Refund Request was approved",
    detail: "Your $79.00 Refund is Pending; this is not confirmation of repayment.",
    time: "1 hr ago",
    course: "React Hooks in Practice",
    unread: true,
    to: "/settings",
  },
  {
    id: 4,
    kind: "discussion",
    title: "Elena asked a Discussion Question",
    detail: "“When should I use a reducer instead of local state?”",
    time: "Yesterday",
    course: "React Hooks in Practice",
    unread: false,
    to: "/instructor/questions",
  },
  {
    id: 5,
    kind: "refund",
    title: "Your Refund was issued",
    detail: "Repayment of $79.00 was confirmed. Your Enrollment has lapsed.",
    time: "Yesterday",
    course: "TypeScript Foundations",
    unread: false,
    to: "/settings",
  },
  {
    id: 6,
    kind: "refund",
    title: "New Refund Request needs review",
    detail: "Liam requested $79.00. Review the evidence and reason.",
    time: "2 days ago",
    course: "Advanced TypeScript",
    unread: false,
    to: "/admin/refunds",
  },
];

const kindInfo = {
  discussion: { label: "Discussions", icon: MessageSquare, color: "text-blue-600 bg-blue-500/10" },
  seat: { label: "Team activity", icon: UsersRound, color: "text-violet-600 bg-violet-500/10" },
  refund: { label: "Refunds", icon: Receipt, color: "text-amber-700 bg-amber-500/10" },
};

function MarkRead({ notice, onRead }: { notice: Notice; onRead: (id: number) => void }) {
  if (!notice.unread) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="shrink-0"
      onClick={() => onRead(notice.id)}
      aria-label={`Mark as read: ${notice.title}`}
    >
      <Check className="size-4" /> <span className="hidden sm:inline">Mark read</span>
    </Button>
  );
}

function Empty({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4"><Inbox className="size-6 text-muted-foreground" /></div>
      <h2 className="text-lg font-semibold">{filtered ? "No unread Notifications" : "You're all caught up"}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {filtered ? "Switch to All to see your earlier Notifications." : "New replies, Seat claims, and refund outcomes will appear here."}
      </p>
    </div>
  );
}

function Filters({ unreadOnly, setUnreadOnly, count }: { unreadOnly: boolean; setUnreadOnly: (v: boolean) => void; count: number }) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1" aria-label="Notification filter">
      <button onClick={() => setUnreadOnly(false)} aria-pressed={!unreadOnly} className={cn("rounded-md px-3 py-1.5 text-sm", !unreadOnly && "bg-background shadow-sm")}>All</button>
      <button onClick={() => setUnreadOnly(true)} aria-pressed={unreadOnly} className={cn("rounded-md px-3 py-1.5 text-sm", unreadOnly && "bg-background shadow-sm")}>Unread <span className="ml-1 text-xs text-muted-foreground">{count}</span></button>
    </div>
  );
}

function Popover({ notices, onRead, onAllRead, unreadOnly, setUnreadOnly }: VariantProps) {
  const [open, setOpen] = useState(true);
  const visible = unreadOnly ? notices.filter((n) => n.unread) : notices;
  const unread = notices.filter((n) => n.unread).length;
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Home / Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Review Notifications without leaving your work.</p>
        </div>
        <div className="relative">
          <Button variant="outline" size="lg" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="notification-popover">
            <Bell className="size-5" />
            <span className="sr-only">Notifications</span>
            {unread > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs font-bold text-white" aria-label={`${unread} unread`}>{unread}</span>}
          </Button>
          {open && (
            <section id="notification-popover" aria-label="Notification Inbox" className="absolute right-0 top-14 z-20 w-[min(420px,calc(100vw-3rem))] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl">
              <div className="flex items-center justify-between border-b p-4">
                <div><h2 className="font-semibold">Notifications</h2><p className="text-xs text-muted-foreground">Opening doesn't mark items read.</p></div>
                <Button variant="ghost" size="sm" onClick={onAllRead} disabled={!unread}><CheckCheck className="size-4" /> Mark all read</Button>
              </div>
              <div className="border-b p-3"><Filters unreadOnly={unreadOnly} setUnreadOnly={setUnreadOnly} count={unread} /></div>
              <div className="max-h-[430px] overflow-y-auto">
                {visible.length === 0 ? <Empty filtered={unreadOnly} /> : visible.map((notice) => {
                  const Icon = kindInfo[notice.kind].icon;
                  return (
                    <article key={notice.id} className={cn("flex gap-3 border-b p-4 last:border-0", notice.unread && "bg-primary/5")}>
                      <div className={cn("mt-1 rounded-full p-2", kindInfo[notice.kind].color)}><Icon className="size-4" /></div>
                      <div className="min-w-0 flex-1">
                        <Link to={notice.to} onClick={() => onRead(notice.id)} className="block rounded focus-visible:outline-2 focus-visible:outline-ring">
                          <h3 className={cn("text-sm leading-5", notice.unread && "font-semibold")}>{notice.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{notice.detail}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{notice.course} · {notice.time}</p>
                        </Link>
                      </div>
                      <MarkRead notice={notice} onRead={onRead} />
                    </article>
                  );
                })}
              </div>
              <div className="border-t p-3 text-center text-xs text-muted-foreground">Compact feed · scroll for earlier items</div>
            </section>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {["Continue learning", "Your courses", "Team activity"].map((item) => <div key={item} className="rounded-xl border bg-card p-5"><h2 className="font-medium">{item}</h2><div className="mt-8 h-2 rounded bg-muted" /></div>)}
      </div>
      <div className="mt-6 rounded-xl border border-dashed p-8 text-sm text-muted-foreground">The inbox lives in a small popover above existing content. Useful for quick triage; long explanations compete for space.</div>
      <State notices={notices} unreadOnly={unreadOnly} />
    </div>
  );
}

function SidebarInbox({ notices, onRead, onAllRead, unreadOnly, setUnreadOnly }: VariantProps) {
  const [category, setCategory] = useState<Kind | "all">("all");
  const unread = notices.filter((n) => n.unread).length;
  const visible = notices.filter((n) => (!unreadOnly || n.unread) && (category === "all" || n.kind === category));
  const [selectedId, setSelectedId] = useState(1);
  const selected = notices.find((n) => n.id === selectedId);
  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-[280px_minmax(0,1fr)]">
      <section className="border-b lg:border-b-0 lg:border-r" aria-label="Notification categories">
        <div className="border-b p-5"><div className="flex items-center gap-2"><Bell className="size-5" /><h1 className="text-lg font-semibold">Notifications</h1></div><p className="mt-1 text-sm text-muted-foreground">{unread} unread</p></div>
        <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col" aria-label="Filter by kind">
          {([{ key: "all", label: "All Notifications", icon: Inbox }, ...Object.entries(kindInfo).map(([key, info]) => ({ key, label: info.label, icon: info.icon }))] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setCategory(key as Kind | "all")} aria-pressed={category === key} className={cn("flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-left text-sm", category === key ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/50")}><Icon className="size-4" />{label}<span className="ml-auto text-xs">{key === "all" ? notices.length : notices.filter((n) => n.kind === key).length}</span></button>
          ))}
        </nav>
        <div className="hidden p-3 lg:block"><Filters unreadOnly={unreadOnly} setUnreadOnly={setUnreadOnly} count={unread} /></div>
      </section>
      <section className="grid md:grid-cols-[minmax(260px,1fr)_minmax(300px,1fr)]" aria-label="Notification list and preview">
        <div className="border-r">
          <div className="flex items-center justify-between border-b p-4"><h2 className="font-medium">{category === "all" ? "Recent" : kindInfo[category].label}</h2><Button variant="ghost" size="sm" onClick={onAllRead} disabled={!unread}><CheckCheck className="size-4" /> Mark all read</Button></div>
          <div className="p-3 md:hidden"><Filters unreadOnly={unreadOnly} setUnreadOnly={setUnreadOnly} count={unread} /></div>
          {visible.length === 0 ? <Empty filtered={unreadOnly} /> : visible.map((notice) => {
            const Icon = kindInfo[notice.kind].icon;
            return <button key={notice.id} onClick={() => { setSelectedId(notice.id); onRead(notice.id); }} aria-pressed={selectedId === notice.id} className={cn("flex w-full gap-3 border-b p-4 text-left", selectedId === notice.id ? "bg-accent" : notice.unread && "bg-primary/5")}><Icon className="mt-1 size-4 shrink-0" /><span className="min-w-0"><span className={cn("block text-sm", notice.unread && "font-semibold")}>{notice.title}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{notice.course} · {notice.time}</span></span>{notice.unread && <Circle className="ml-auto size-2 shrink-0 fill-primary text-primary" aria-label="Unread" />}</button>;
          })}
        </div>
        {selected ? <article className="p-6"><div className={cn("inline-flex rounded-full p-3", kindInfo[selected.kind].color)}>{(() => { const Icon = kindInfo[selected.kind].icon; return <Icon className="size-5" />; })()}</div><p className="mt-5 text-xs uppercase tracking-wide text-muted-foreground">{selected.course} · {selected.time}</p><h2 className="mt-2 text-xl font-semibold">{selected.title}</h2><p className="mt-4 leading-7 text-muted-foreground">{selected.detail}</p><Button asChild className="mt-6"><Link to={selected.to}>Open in Cadence</Link></Button><div className="mt-6"><MarkRead notice={selected} onRead={onRead} /></div></article> : <Empty filtered={false} />}
      </section>
      <div className="border-t p-4 lg:col-span-2"><State notices={notices} unreadOnly={unreadOnly} /></div>
    </div>
  );
}

function FullPage({ notices, onRead, onAllRead, unreadOnly, setUnreadOnly }: VariantProps) {
  const unread = notices.filter((n) => n.unread).length;
  const visible = unreadOnly ? notices.filter((n) => n.unread) : notices;
  return (
    <div className="mx-auto max-w-4xl p-6 pb-28 lg:p-10">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to Dashboard</Link>
      <header className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="text-3xl font-bold tracking-tight">Notification Inbox</h1><p className="mt-2 text-muted-foreground">Replies, team activity, and financial outcomes in one place.</p></div>
        <Button variant="outline" onClick={onAllRead} disabled={!unread}><CheckCheck className="size-4" /> Mark all as read</Button>
      </header>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b pb-4"><Filters unreadOnly={unreadOnly} setUnreadOnly={setUnreadOnly} count={unread} /><span className="text-sm text-muted-foreground">Newest first</span></div>
      <div className="divide-y">
        {visible.length === 0 ? <Empty filtered={unreadOnly} /> : visible.map((notice) => {
          const Icon = kindInfo[notice.kind].icon;
          return (
            <article key={notice.id} className="py-6">
              <div className="flex gap-4">
                <div className={cn("hidden h-10 w-10 shrink-0 place-items-center rounded-full sm:grid", kindInfo[notice.kind].color)}><Icon className="size-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{kindInfo[notice.kind].label}</span><span className="text-xs text-muted-foreground">{notice.time}</span>{notice.unread && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Unread</span>}</div>
                  <Link to={notice.to} onClick={() => onRead(notice.id)} className="mt-2 block rounded focus-visible:outline-2 focus-visible:outline-ring"><h2 className={cn("text-lg", notice.unread && "font-semibold")}>{notice.title}</h2><p className="mt-2 leading-6 text-muted-foreground">{notice.detail}</p><p className="mt-2 text-sm text-muted-foreground">{notice.course}</p></Link>
                  <div className="mt-3 flex gap-2"><Button asChild variant="outline" size="sm"><Link to={notice.to} onClick={() => onRead(notice.id)}>Open</Link></Button><MarkRead notice={notice} onRead={onRead} /></div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <State notices={notices} unreadOnly={unreadOnly} />
    </div>
  );
}

function State({ notices, unreadOnly }: { notices: Notice[]; unreadOnly: boolean }) {
  return <details className="mt-6 rounded-lg border border-dashed p-3 text-xs text-muted-foreground"><summary>Prototype state (in memory only)</summary><pre className="mt-2 overflow-auto">{JSON.stringify({ unread: notices.filter((n) => n.unread).length, read: notices.filter((n) => !n.unread).length, filter: unreadOnly ? "unread" : "all" }, null, 2)}</pre></details>;
}

type VariantProps = { notices: Notice[]; onRead: (id: number) => void; onAllRead: () => void; unreadOnly: boolean; setUnreadOnly: (v: boolean) => void };
const variants = [
  { key: "A", name: "Bell popover", component: Popover },
  { key: "B", name: "Category sidebar", component: SidebarInbox },
  { key: "C", name: "Full-page inbox", component: FullPage },
];

export function NotificationInboxPrototype() {
  const [params, setParams] = useSearchParams();
  const current = variants.find((v) => v.key === params.get("variant")) ?? variants[0];
  const [notices, setNotices] = useState(initialNotices);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const Variant = current.component;
  const cycle = (delta: number) => {
    const next = variants[(variants.indexOf(current) + delta + variants.length) % variants.length];
    setParams({ variant: next.key });
  };
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("input,textarea,[contenteditable]")) return;
      if (event.key === "ArrowLeft") cycle(-1);
      if (event.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  });
  const onRead = (id: number) => setNotices((items) => items.map((n) => n.id === id ? { ...n, unread: false } : n));
  return (
    <>
      <div className="border-b bg-amber-500/10 px-4 py-2 text-center text-xs font-medium text-amber-900 dark:text-amber-100">THROWAWAY PROTOTYPE · Actions affect only this page · No Notifications are sent</div>
      <Variant notices={notices} onRead={onRead} onAllRead={() => setNotices((items) => items.map((n) => ({ ...n, unread: false })))} unreadOnly={unreadOnly} setUnreadOnly={setUnreadOnly} />
      {process.env.NODE_ENV !== "production" && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-foreground p-1 text-background shadow-xl"><Button variant="ghost" size="icon" className="rounded-full hover:bg-background/20 hover:text-background" onClick={() => cycle(-1)} aria-label="Previous prototype variant"><ChevronLeft /></Button><span className="min-w-48 text-center text-sm">{current.key} · {current.name}</span><Button variant="ghost" size="icon" className="rounded-full hover:bg-background/20 hover:text-background" onClick={() => cycle(1)} aria-label="Next prototype variant"><ChevronRight /></Button></div>}
    </>
  );
}
