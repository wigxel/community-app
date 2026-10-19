import { cleanup, render, screen } from "@testing-library/react";
import type { BasicProject } from "~/types/models";

const { mockUsePaginatedQuery } = vi.hoisted(() => ({
  mockUsePaginatedQuery: vi.fn(),
}));

vi.mock("convex/react", () => ({
  usePaginatedQuery: (...args: unknown[]) => mockUsePaginatedQuery(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("~/components/organism/searchbox", () => ({
  SearchBoxSubmit: () => <div data-testid="search-box" />,
}));

vi.mock("~/app/_components/landing-project-card", () => ({
  default: ({ project }: { project: BasicProject }) => (
    <div data-testid="project-card">{project.title}</div>
  ),
}));

vi.mock("~/app/_components/ProjectModal", () => ({
  ProjectModal: () => null,
}));

import SearchProjectsCatalog from "~/app/(public)/search/_components/search-catalog";

function project(id: string, title: string): BasicProject {
  return { _id: id, title } as unknown as BasicProject;
}

function mockPage(
  overrides: Partial<{
    results: BasicProject[];
    status: string;
    loadMore: () => void;
  }> = {},
) {
  mockUsePaginatedQuery.mockReturnValue({
    results: [],
    status: "Exhausted",
    loadMore: vi.fn(),
    ...overrides,
  });
}

describe("SearchProjectsCatalog — UI states", () => {
  beforeEach(() => {
    mockUsePaginatedQuery.mockReset();
    mockPage();
  });

  afterEach(cleanup);

  it("shows the prompt state when there is no query", () => {
    render(
      <SearchProjectsCatalog searchQuery="" emptyPrompt initialProjects={[]} />,
    );

    expect(
      screen.getByText(/Type something to search projects/i),
    ).toBeDefined();
    expect(screen.getByTestId("search-box")).toBeDefined();
    expect(screen.queryByText(/No projects match/i)).toBeNull();
    expect(screen.queryByText(/Failed to load/i)).toBeNull();
  });

  it("shows the no-results state when a query returns nothing", () => {
    render(<SearchProjectsCatalog searchQuery="zzz" initialProjects={[]} />);

    expect(screen.getByText(/No projects match/i)).toBeDefined();
    expect(screen.getByText(/zzz/)).toBeDefined();
    expect(screen.getByTestId("search-box")).toBeDefined();
    expect(screen.queryByText(/Type something to search/i)).toBeNull();
  });

  it("shows the error state when SSR fails", () => {
    render(
      <SearchProjectsCatalog
        ssrError
        searchQuery="react"
        initialProjects={[]}
      />,
    );

    expect(screen.getByText(/Failed to load projects/i)).toBeDefined();
    expect(screen.getByTestId("search-box")).toBeDefined();
    expect(screen.queryByText(/No projects match/i)).toBeNull();
    expect(screen.queryByText(/Type something to search/i)).toBeNull();
  });

  it("renders initial SSR projects", () => {
    render(
      <SearchProjectsCatalog
        searchQuery="react"
        initialProjects={[project("p1", "React App")]}
      />,
    );

    expect(screen.getByText("React App")).toBeDefined();
    expect(screen.queryByText(/No projects match/i)).toBeNull();
  });

  it("merges paginated results with SSR-only projects", () => {
    mockPage({ results: [project("p2", "Paginated Project")] });

    render(
      <SearchProjectsCatalog
        searchQuery="proj"
        initialProjects={[
          project("p1", "SSR Project"),
          project("p2", "Paginated Project"),
        ]}
      />,
    );

    expect(screen.getByText("Paginated Project")).toBeDefined();
    expect(screen.getByText("SSR Project")).toBeDefined();
    // p2 came from the paginated results, so it is not duplicated.
    expect(screen.getAllByText("Paginated Project")).toHaveLength(1);
  });

  it("shows a skeleton when there is no initial data", () => {
    render(<SearchProjectsCatalog searchQuery="react" />);

    expect(document.querySelectorAll("section").length).toBeGreaterThan(0);
    expect(screen.queryByText(/No projects match/i)).toBeNull();
    expect(screen.queryByText(/Type something to search/i)).toBeNull();
  });

  it("shows the no-results state instead of skeleton when query yields zero", () => {
    render(
      <SearchProjectsCatalog searchQuery="nothing" initialProjects={[]} />,
    );

    expect(screen.getByText(/No projects match/i)).toBeDefined();
    expect(document.querySelectorAll("section")).toHaveLength(0);
  });
});
