import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LessonNote } from "./lesson-note";

const mocks = vi.hoisted(() => ({ useFetcher: vi.fn() }));

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useFetcher: mocks.useFetcher,
}));

function mockFetcher({
  state = "idle",
  data,
}: {
  state?: "idle" | "submitting" | "loading";
  data?:
    | { ok: true; note: { body: string; updatedAt: string } }
    | { ok: false; error: string };
} = {}) {
  function Form({ children, ...props }: ComponentProps<"form">) {
    return <form {...props}>{children}</form>;
  }

  mocks.useFetcher.mockReturnValue({ Form, state, data });
}

function renderNote(note: { body: string; updatedAt: string } | null = null) {
  return renderToStaticMarkup(<LessonNote note={note} />);
}

beforeEach(() => {
  mockFetcher();
});

describe("LessonNote", () => {
  it("explains that notes are private and gives the editor useful guidance", () => {
    const html = renderNote();

    expect(html).toContain("Your notes");
    expect(html).toContain("Private to you");
    expect(html).toContain("Only you can see these notes.");
    expect(html).toContain(
      "Capture an idea, a question, or something to revisit"
    );
    expect(html).toContain('maxLength="2000"');
    expect(html).toContain("0 / 2,000");
  });

  it("shows the saved Note and its last-edited time", () => {
    const html = renderNote({
      body: "Remember the structural typing example",
      updatedAt: "2026-10-06T12:00:00.000Z",
    });

    expect(html).toContain("Remember the structural typing example");
    expect(html).toContain("All changes saved");
    expect(html).toContain("Last edited");
  });

  it("reports saving and disables repeat submissions", () => {
    mockFetcher({ state: "submitting" });
    const html = renderNote({
      body: "A note in progress",
      updatedAt: "2026-10-06T12:00:00.000Z",
    });

    expect(html).toContain("Saving…");
    expect(html).toContain("disabled");
  });

  it("exposes a save failure as an alert", () => {
    mockFetcher({
      data: { ok: false, error: "Your note could not be saved." },
    });
    const html = renderNote();

    expect(html).toContain('role="alert"');
    expect(html).toContain("Your note could not be saved.");
  });
});
