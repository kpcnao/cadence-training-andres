import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { UserRole } from "~/db/schema";
import Home from "./home";

type HomeProps = ComponentProps<typeof Home>;
type LoaderData = HomeProps["loaderData"];

const anonymousLoaderData = {
  featuredCourses: [],
  totalCourses: 4,
  totalCategories: 5,
  users: [],
  currentUser: null,
  devCountry: null,
  countryTierInfo: { tier: 1, discount: 0, label: "Full Price" },
  countries: [],
} satisfies LoaderData;

function renderHome(loaderData: LoaderData) {
  const props = { loaderData } as HomeProps;
  const router = createMemoryRouter([
    { path: "/", element: <Home {...props} /> },
  ]);
  return renderToStaticMarkup(<RouterProvider router={router} />);
}

describe("Home", () => {
  it("renders the left-aligned hero and learning preview", () => {
    const html = renderHome(anonymousLoaderData);

    expect(html).toContain("<main>");
    expect(html).toContain("text-left");
    expect(html).not.toContain("text-center");
    expect(html).toContain("Learn to code,");
    expect(html).toContain("at your own pace.");
    expect(html).toContain(
      'aria-label="A preview of the Cadence learning experience"'
    );
  });

  it("gives anonymous visitors routes to browse courses and sign up", () => {
    const html = renderHome(anonymousLoaderData);

    expect(html).toContain("Browse Courses");
    expect(html).toContain('href="/courses"');
    expect(html).toContain("Start learning");
    expect(html).toContain('href="/signup"');
    expect(html).not.toContain("Continue learning");
  });

  it("gives signed-in visitors a route back to their dashboard", () => {
    const html = renderHome({
      ...anonymousLoaderData,
      currentUser: { id: 1, name: "Test Learner", role: UserRole.Student },
    });

    expect(html).toContain("Continue learning");
    expect(html).toContain('href="/dashboard"');
    expect(html).not.toContain("Start learning");
  });
});
