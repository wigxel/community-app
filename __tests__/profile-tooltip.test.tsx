import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

const { mockUseQuery } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

import { ProfileTooltip } from "~/components/molecules/project-card/profile-tooltip";

const profile = {
  username: "ada",
  profileImage: null,
  verified: false,
  title: { _id: "t1", name: "Software Engineer", description: null },
  shortBio: "Builds for the web.",
  resolvedSkills: [{ name: "React" }],
  location: { city: "Lagos", country: "Nigeria" },
};

/** Profile query returns the fixture; nothing else is subscribed. */
function mockProfile(overrides: Partial<typeof profile> = {}) {
  mockUseQuery.mockImplementation(() => ({ ...profile, ...overrides }));
}

function renderTooltip(username: string | null = "@ada") {
  render(
    <ProfileTooltip name="Ada Lovelace" username={username}>
      <span>{username ?? "--"}</span>
    </ProfileTooltip>,
  );
}

function hoverAndOpen(label = "@ada") {
  // Radix's trigger opens on pointermove and closes on pointerleave.
  fireEvent.pointerMove(screen.getByText(label), { pointerType: "mouse" });
  act(() => {
    vi.advanceTimersByTime(200);
  });
}

describe("ProfileTooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockProfile();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("renders nothing and fetches nothing until hovered past the delay", () => {
    renderTooltip();

    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(mockUseQuery).not.toHaveBeenCalled();

    fireEvent.pointerMove(screen.getByText("@ada"), { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByRole("tooltip")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Ada Lovelace");
    expect(tooltip).toHaveTextContent("Software Engineer");
    expect(tooltip).toHaveTextContent("Builds for the web.");
    expect(tooltip).toHaveTextContent("React");
    expect(tooltip).toHaveTextContent("Based in Lagos");
    expect(tooltip.querySelector(".line-clamp-2")).toHaveTextContent(
      "Builds for the web.",
    );
  });

  it("unmounts the tooltip on mouse leave", () => {
    renderTooltip();
    hoverAndOpen();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    // Leaving the trigger enters Radix's grace area; a document-level
    // pointermove away from trigger and content is what actually closes it.
    fireEvent.pointerOut(screen.getByText("@ada"), {
      pointerType: "mouse",
      relatedTarget: document.body,
    });
    fireEvent.pointerMove(document.body, {
      pointerType: "mouse",
      clientX: 999,
      clientY: 999,
    });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("renders plain content when there is no username", () => {
    renderTooltip(null);
    hoverAndOpen("--");

    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(mockUseQuery).not.toHaveBeenCalled();
  });

  it("shows the skeleton while the profile query loads", () => {
    // Uncached username: the stale-while-revalidate cache would otherwise
    // serve the profile from an earlier test instead of loading.
    mockUseQuery.mockImplementation(() => undefined);
    renderTooltip("@fresh");
    hoverAndOpen("@fresh");

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.querySelectorAll(".animate-pulse")).toHaveLength(4);
    expect(tooltip.textContent).not.toContain("Ada Lovelace");
  });

  it("shows nothing when the profile does not exist", () => {
    mockUseQuery.mockImplementation(() => null);
    renderTooltip("@ghost");
    hoverAndOpen("@ghost");

    // jsdom can't apply the empty:hidden CSS, so assert the bubble renders
    // with no children — in the browser the :empty rule hides it entirely.
    const tooltip = screen.queryByRole("tooltip");
    expect(tooltip).toBeEmptyDOMElement();
    expect(tooltip?.textContent).not.toContain("Ada Lovelace");
  });

  it("renders V3 (divider + location only) when there is no bio and no skills", () => {
    mockProfile({
      shortBio: undefined,
      resolvedSkills: [],
      location: { city: "", country: "Nigeria" },
    });
    renderTooltip();
    hoverAndOpen();

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.querySelector(".h-px")).toBeInTheDocument();
    expect(tooltip.textContent).toContain("Based in Nigeria");
    expect(tooltip.textContent).not.toContain("React");
  });

  it("renders the compact footer (V2) when the profile has no bio but has skills", () => {
    mockProfile({ shortBio: undefined });
    renderTooltip();
    hoverAndOpen();

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.querySelector(".h-px")).toBeInTheDocument();
    expect(tooltip.textContent).toContain("Based in Lagos");
    expect(tooltip.textContent).toContain("React");
    expect(tooltip.textContent).not.toContain("Builds for the web.");
  });
});
