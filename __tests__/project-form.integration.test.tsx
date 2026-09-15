import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// --- Mocks (vi.hoisted runs before imports) ---

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const { mockUseQuery, mockUseMutation } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
  mockUseMutation: vi.fn(),
}));

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}));

vi.mock("~/lib/toast", () => ({ toast }));
vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));
vi.mock("~/components/forms/project/media-section", () => ({
  MediaSection: () => <div data-testid="media-section" />,
}));
vi.mock("motion/react", () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag: string) =>
        React.forwardRef(
          (
            props: React.PropsWithChildren<Record<string, unknown>>,
            ref: React.Ref<unknown>,
          ) => React.createElement(tag, { ...props, ref }),
        ),
    },
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
}));

// --- Imports after mocks ---

import { ProjectForm } from "~/components/forms/project/project-form";
import { Result } from "~/lib/result";
import type { ProjectLink } from "~/types/models";

// --- Mock data ---

const MOCK_PROJECT_ID = "mock-project-id-123";

const MOCK_PROJECT = {
  _id: MOCK_PROJECT_ID,
  userId: "user-1",
  title: "Existing Project",
  description: "A project loaded from the database",
  timeline: {
    start: { month: "January", year: "2024" },
    end: { month: "June", year: "2024" },
  },
  ongoing: false,
  media: [],
  link: [
    {
      tag: "github" as const,
      value: "https://github.com/acme/web-app",
    },
  ],
};

// --- Helpers ---

function setupConvexMocks(project: Record<string, unknown> = MOCK_PROJECT) {
  mockUseQuery.mockReset();
  mockUseMutation.mockReset();
  mockUseQuery.mockReturnValue(Result.ok(project));
  const noop = vi.fn().mockResolvedValue({ _tag: "Right", right: {} });
  mockUseMutation.mockReturnValue(noop);
}

function renderForm() {
  const user = userEvent.setup();
  const result = render(
    <ProjectForm mode="edit" projectId={MOCK_PROJECT_ID} />,
  );
  return { user, ...result };
}

function getLinkInput() {
  return screen.getByRole("textbox", { name: /link.*value/i });
}

/** Get the link row's tag combobox specifically (near the link input) */
function getLinkCombobox() {
  // Find the link input, then walk up to the row container and find its combobox
  const input = getLinkInput();
  const row = input.closest("div[class*='rounded-xl']");
  if (!row) throw new Error("Link row container not found");
  const combobox = row.querySelector('[role="combobox"]') as HTMLElement;
  if (!combobox) throw new Error("Link combobox not found in row");
  return combobox;
}

async function waitForLinkReady() {
  const { waitFor } = await import("@testing-library/react");
  await waitFor(() => {
    expect(getLinkInput()).toBeInTheDocument();
  });
}

async function selectTimeline(
  user: ReturnType<typeof userEvent.setup>,
  triggerId: string,
  year: string,
) {
  const trigger = document.getElementById(triggerId);
  if (!trigger) throw new Error(`Timeline trigger not found: ${triggerId}`);
  await user.click(trigger);
  const option = screen.getByRole("option", { name: year });
  await user.click(option);
}

async function fillRequiredFields(
  user: ReturnType<typeof userEvent.setup>,
  overrides?: { title?: string; startYear?: string; endYear?: string },
) {
  const title = overrides?.title ?? "Test Project";
  const startYear = overrides?.startYear ?? "2024";
  const endYear = overrides?.endYear ?? "2025";

  const titleInput = screen.getByPlaceholderText("Project name");
  await user.clear(titleInput);
  await user.type(titleInput, title);

  await selectTimeline(user, "start_year", startYear);
  await selectTimeline(user, "end_year", endYear);
}

function setupUpdateProjectMock() {
  const updateProject = vi.fn().mockResolvedValue({
    _tag: "Right",
    right: { _id: MOCK_PROJECT_ID },
  });

  mockUseMutation.mockReset();
  mockUseMutation.mockReturnValue(updateProject);

  return updateProject;
}

// --- Tests ---

describe("ProjectForm integration", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    setupConvexMocks();
  });

  it("strips full URL to path-only on edit load", async () => {
    renderForm();
    await waitForLinkReady();
    expect(getLinkInput()).toHaveValue("acme/web-app");
  });

  it("auto-switches tag and strips value on paste", async () => {
    const projectWithOther = {
      ...MOCK_PROJECT,
      link: [{ tag: "other" as const, value: "https://example.com" }],
    };
    setupConvexMocks(projectWithOther);

    const { user } = renderForm();
    await waitForLinkReady();
    expect(getLinkInput()).toHaveValue("https://example.com");

    await act(async () => {
      await user.click(getLinkInput());
      await user.paste("https://github.com/user/repo");
    });

    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(getLinkInput()).toHaveValue("user/repo");
    });

    expect(getLinkCombobox()).toHaveTextContent("GitHub");
  });

  it("reconstructs full URL on submit", async () => {
    const updateProject = setupUpdateProjectMock();
    const { user } = renderForm();
    await waitForLinkReady();

    await fillRequiredFields(user);

    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledTimes(1);
      const callArg = updateProject.mock.calls[0][0];
      expect(callArg.project.link[0]).toEqual({
        tag: "github",
        value: "https://github.com/acme/web-app",
      });
    });
  });

  it("submits with correct tag after paste auto-switch", async () => {
    const projectWithOther = {
      ...MOCK_PROJECT,
      link: [{ tag: "other" as const, value: "" }],
    };

    setupConvexMocks(projectWithOther);

    const updateProject = setupUpdateProjectMock();
    const { user } = renderForm();
    await waitForLinkReady();
    expect(getLinkInput()).toHaveValue("");

    await act(async () => {
      await user.click(getLinkInput());
      await user.paste("https://figma.com/design/abc123");
    });

    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(getLinkInput()).toHaveValue("design/abc123");
    });

    expect(getLinkCombobox()).toHaveTextContent("Figma");

    await fillRequiredFields(user);

    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledTimes(1);
      const callArg = updateProject.mock.calls[0][0];
      expect(callArg.project.link[0]).toEqual({
        tag: "figma",
        value: "https://figma.com/design/abc123",
      });
    });
  });

  it("navigates to projects list after successful save", async () => {
    setupUpdateProjectMock();
    const { user } = renderForm();
    await waitForLinkReady();

    await fillRequiredFields(user);

    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/projects");
    });
  });

  it("shows success toast after save", async () => {
    setupUpdateProjectMock();
    const { user } = renderForm();
    await waitForLinkReady();

    await fillRequiredFields(user);

    const submitButton = screen.getByRole("button", { name: /save/i });
    await user.click(submitButton);

    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Project updated successfully",
      );
    });
  });
});
