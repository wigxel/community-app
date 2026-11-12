import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { mockUsePaginatedQuery } = vi.hoisted(() => ({
  mockUsePaginatedQuery: vi.fn(),
}));

vi.mock("convex/react", () => ({
  usePaginatedQuery: (...args: unknown[]) => mockUsePaginatedQuery(...args),
}));

vi.mock("~/app/_components/landing-project-card", () => ({
  default: ({ project }: { project: { _id: string } }) => (
    <div data-testid={`project-card-${project._id}`} />
  ),
}));

vi.mock(
  "~/app/(public)/profile/[username]/(projects)/_components/load-more-button",
  () => ({
    LoadMoreButton: ({
      status,
      onLoadMore,
    }: {
      status?: string;
      onLoadMore?: () => void;
    }) => (
      <button
        data-testid="load-more"
        data-status={status}
        onClick={onLoadMore}
      />
    ),
  }),
);

import ProfileProjects, {
  PAGE_SIZE,
} from "~/app/(public)/profile/[username]/(projects)/_components/project";
import type { BasicProject } from "~/types/models";

function project(id: string) {
  return { _id: id } as unknown as BasicProject;
}

function setupPaginated(
  opts: {
    results?: BasicProject[];
    status?: string;
  } = {},
) {
  const loadMore = vi.fn();
  mockUsePaginatedQuery.mockReturnValue({
    results: opts.results ?? [],
    status: opts.status ?? "Exhausted",
    loadMore,
  });
  return { loadMore };
}

describe("ProfileProjects", () => {
  it("shows skeleton while loading first page with no items", () => {
    setupPaginated({ results: [], status: "LoadingFirstPage" });
    const { container } = render(
      <ProfileProjects userId="u1" initialItems={[]} />,
    );
    expect(screen.queryByText(/No projects yet/i)).toBeNull();
    expect(screen.queryByTestId(/project-card-/)).toBeNull();
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("shows empty state when loaded with no projects", () => {
    setupPaginated({ results: [], status: "Exhausted" });
    render(<ProfileProjects userId="u1" initialItems={[]} />);
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });

  it("renders SSR initialItems when results are empty", () => {
    setupPaginated({ results: [], status: "CanLoadMore" });
    render(<ProfileProjects userId="u1" initialItems={[project("p1")]} />);
    expect(screen.getByTestId("project-card-p1")).toBeInTheDocument();
  });

  it("merges results and ssr-only items without duplicates", () => {
    setupPaginated({
      results: [project("p1"), project("p2")],
      status: "CanLoadMore",
    });
    render(
      <ProfileProjects
        userId="u1"
        initialItems={[project("p2"), project("p3")]}
      />,
    );
    expect(screen.getByTestId("project-card-p1")).toBeInTheDocument();
    expect(screen.getByTestId("project-card-p2")).toBeInTheDocument();
    expect(screen.getByTestId("project-card-p3")).toBeInTheDocument();
    expect(screen.getAllByTestId("project-card-p2")).toHaveLength(1);
  });

  it("wires load more with PAGE_SIZE", async () => {
    const { loadMore } = setupPaginated({
      results: [project("p1")],
      status: "CanLoadMore",
    });
    const user = userEvent.setup();
    render(<ProfileProjects userId="u1" initialItems={[]} />);
    const btn = screen.getByTestId("load-more");
    expect(btn).toHaveAttribute("data-status", "CanLoadMore");
    await user.click(btn);
    expect(loadMore).toHaveBeenCalledTimes(1);
    expect(loadMore).toHaveBeenCalledWith(PAGE_SIZE);
  });
});
