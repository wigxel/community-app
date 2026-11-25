import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// --- Mocks (vi.hoisted runs before imports) ---

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const { reorder } = vi.hoisted(() => ({
  reorder: {
    values: [] as unknown[],
    onReorder: null as null | ((order: unknown[]) => void),
  },
}));

const { mockUseQuery, mockUseMutation, apiMocks } = vi.hoisted(() => {
  // Stable stub refs — the real `api` is a Proxy returning a new object per
  // property access, so identity matching is impossible there.
  const apiMocks = {
    profiles: {
      getProfile: { path: "profiles:getProfile" },
      updateProfile: { path: "profiles:updateProfile" },
      updateProfileImages: { path: "profiles:updateProfileImages" },
    },
    skills: { listSkills: { path: "skills:listSkills" } },
    titles: { listTitles: { path: "titles:listTitles" } },
    files: { generateUploadUrl: { path: "files:generateUploadUrl" } },
    workExperience: {
      getByUserId: { path: "workExperience:getByUserId" },
      create: { path: "workExperience:create" },
      update: { path: "workExperience:update" },
      remove: { path: "workExperience:remove" },
    },
  };
  return {
    mockUseQuery: vi.fn(),
    mockUseMutation: vi.fn(),
    apiMocks,
  };
});

vi.mock("~/lib/toast", () => ({ toast }));
vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));
vi.mock("~/convex/_generated/api", () => ({ api: apiMocks }));
vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

// Stable per-tag components — a fresh component per access would remount
// the hover bar subtree on every render, detaching the DOM node mid-click.
const motionTags = new Map<string, React.ComponentType>();
vi.mock("motion/react", () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag: string) => {
        if (!motionTags.has(tag)) {
          motionTags.set(
            tag,
            React.forwardRef(
              (
                props: React.PropsWithChildren<Record<string, unknown>>,
                ref: React.Ref<unknown>,
              ) => React.createElement(tag, { ...props, ref }),
            ),
          );
        }
        return motionTags.get(tag);
      },
    },
  ),
  Reorder: {
    Group: (props: {
      children?: React.ReactNode;
      values?: unknown[];
      onReorder?: (order: unknown[]) => void;
    }) => {
      reorder.values = props.values ?? [];
      reorder.onReorder = props.onReorder ?? null;
      return <div>{props.children}</div>;
    },
    Item: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  },
  useDragControls: () => ({ start: vi.fn() }),
}));
vi.mock("~/components/profile/profile-images-editor", () => ({
  ProfileImagesEditor: () => <div data-testid="profile-images-editor" />,
}));
vi.mock("~/components/profile/skills-select", () => ({
  SkillsSelect: (props: { value?: string[] }) => (
    <div data-testid="skills-select" data-value={JSON.stringify(props.value)} />
  ),
}));
vi.mock("~/components/molecules/navigation-focus", () => ({
  NavigationFocus: ({ children }: { children: React.ReactNode }) => children,
}));

// --- Imports after mocks ---

import { ProfileForm } from "~/app/(account)/dashboard/settings/profile/page";

// --- Mock data ---

const INITIAL_DATA = {
  firstname: "Ada",
  lastname: "Lovelace",
  email: "ada@example.com",
  phonenumbers: "+1234567890",
  title: "",
  shortBio: "Bio",
  profileImage: "",
  coverImage: "",
  workExperience: [],
  interests: "a, b",
  location: { city: "Lagos", country: "Nigeria" },
  link: [] as { tag: string; value: string }[],
  skills: [],
  rateAmount: "",
};

const PROFILE = { userId: "user-1" };
const SKILLS = [{ _id: "skill-1", name: "React" }];

function setupMocks() {
  mockUseQuery.mockReset();
  mockUseMutation.mockReset();
  mockUseQuery.mockImplementation((fn: unknown) => {
    if (fn === apiMocks.profiles.getProfile) return PROFILE;
    if (fn === apiMocks.skills.listSkills) return SKILLS;
    if (fn === apiMocks.workExperience.getByUserId) return [];
    if (fn === apiMocks.titles.listTitles) return [];
    return null;
  });

  const updateProfile = vi.fn().mockResolvedValue(null);
  const createWorkExp = vi.fn().mockResolvedValue("we-1");
  const updateWorkExp = vi.fn().mockResolvedValue(null);
  const removeWorkExp = vi.fn().mockResolvedValue(null);
  mockUseMutation.mockImplementation((fn: unknown) => {
    if (fn === apiMocks.profiles.updateProfile) return updateProfile;
    if (fn === apiMocks.workExperience.create) return createWorkExp;
    if (fn === apiMocks.workExperience.update) return updateWorkExp;
    if (fn === apiMocks.workExperience.remove) return removeWorkExp;
    return vi.fn().mockResolvedValue(null);
  });

  return { updateProfile, createWorkExp, updateWorkExp, removeWorkExp };
}

// --- Helpers ---

function renderForm() {
  const user = userEvent.setup();
  const result = render(<ProfileForm initialData={INITIAL_DATA} />);
  return { user, ...result };
}

function getSaveButton() {
  return screen.getByRole("button", { name: /save changes/i });
}

// --- Tests ---

describe("ProfileForm save bar", () => {
  afterEach(() => {
    vi.clearAllMocks();
    reorder.values = [];
    reorder.onReorder = null;
  });

  it("save is disabled until the form is dirty", () => {
    setupMocks();
    renderForm();

    expect(getSaveButton()).toBeDisabled();
  });

  it("save is enabled after an edit and submits the profile", async () => {
    const { updateProfile } = setupMocks();
    const { user } = renderForm();

    const firstname = screen.getByLabelText("First Name");
    await user.type(firstname, " Okoye");

    expect(getSaveButton()).toBeEnabled();

    await user.click(getSaveButton());

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledTimes(1);
    });
    expect(updateProfile.mock.calls[0][0]).toMatchObject({
      firstName: "Ada Okoye",
      lastName: "Lovelace",
      phoneNumbers: ["+1234567890"],
      interests: ["a", "b"],
    });
    expect(toast.success).toHaveBeenCalledWith("Profile updated successfully!");
  });

  it("hides again after a successful save (form no longer dirty)", async () => {
    setupMocks();
    const { user } = renderForm();

    await user.type(screen.getByLabelText("First Name"), " Okoye");
    await user.click(getSaveButton());

    await waitFor(() => {
      expect(getSaveButton()).toBeDisabled();
    });
  });

  it("cancel restores the saved values", async () => {
    setupMocks();
    const { user } = renderForm();

    await user.type(screen.getByLabelText("First Name"), " Okoye");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByLabelText("First Name")).toHaveValue("Ada");
    expect(getSaveButton()).toBeDisabled();
  });
});

describe("ProfileForm links (standard section)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderWithLink(link: { tag: string; value: string }) {
    setupMocks();
    const user = userEvent.setup();
    render(<ProfileForm initialData={{ ...INITIAL_DATA, link: [link] }} />);
    return { user };
  }

  it("loads a legacy 'website' link as 'other' with the full URL", () => {
    renderWithLink({ tag: "website", value: "https://example.com" });

    expect(screen.getByLabelText("Link 1 value")).toHaveValue(
      "https://example.com",
    );
  });

  it("strips a full GitHub URL to its path on load", () => {
    renderWithLink({ tag: "github", value: "https://github.com/ada/repo" });

    expect(screen.getByLabelText("Link 1 value")).toHaveValue("ada/repo");
  });

  it("submits a rebuilt full URL with tag and title", async () => {
    const { updateProfile } = setupMocks();
    const user = userEvent.setup();
    render(
      <ProfileForm
        initialData={{
          ...INITIAL_DATA,
          link: [{ tag: "github", value: "ada/repo" }],
        }}
      />,
    );

    await user.type(screen.getByLabelText("First Name"), " Okoye");
    await user.click(getSaveButton());

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledTimes(1);
    });
    expect(updateProfile.mock.calls[0][0].links).toEqual([
      { tag: "github", title: "GitHub", value: "https://github.com/ada/repo" },
    ]);
  });

  it("blocks adding more than 3 links", () => {
    setupMocks();
    render(
      <ProfileForm
        initialData={{
          ...INITIAL_DATA,
          link: [
            { tag: "github", value: "ada/repo" },
            { tag: "figma", value: "abc" },
            { tag: "other", value: "https://example.com" },
          ],
        }}
      />,
    );

    const addLink = screen.getByRole("button", {
      name: /maximum of 3|add link/i,
    });
    expect(addLink).toHaveTextContent("Maximum of 3");
    expect(addLink).toBeDisabled();
  });

  it("titled 'Profile links'", () => {
    setupMocks();
    renderForm();

    expect(screen.getByText("Profile links")).toBeInTheDocument();
  });

  it("supports LinkedIn links end to end", async () => {
    const { updateProfile } = setupMocks();
    const user = userEvent.setup();
    render(
      <ProfileForm
        initialData={{
          ...INITIAL_DATA,
          link: [{ tag: "linkedin", value: "in/ada-lovelace" }],
        }}
      />,
    );

    expect(screen.getByLabelText("Link 1 value")).toHaveValue(
      "in/ada-lovelace",
    );

    await user.type(screen.getByLabelText("First Name"), " Okoye");
    await user.click(getSaveButton());

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledTimes(1);
    });
    expect(updateProfile.mock.calls[0][0].links).toEqual([
      {
        tag: "linkedin",
        title: "LinkedIn",
        value: "https://www.linkedin.com/in/ada-lovelace",
      },
    ]);
  });

  it("exposes a drag handle before the tag dropdown", () => {
    setupMocks();
    render(
      <ProfileForm
        initialData={{
          ...INITIAL_DATA,
          link: [{ tag: "github", value: "ada/repo" }],
        }}
      />,
    );

    const handle = screen.getByRole("button", { name: /drag to reorder/i });
    const combobox = handle.parentElement?.querySelector(
      '[role="combobox"]',
    ) as Node;
    expect(combobox).toBeTruthy();
    expect(
      handle.compareDocumentPosition(combobox) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("focuses the invalid link input on submit", async () => {
    setupMocks();
    const user = userEvent.setup();
    render(
      <ProfileForm
        initialData={{
          ...INITIAL_DATA,
          link: [{ tag: "github", value: "" }],
        }}
      />,
    );

    await user.type(screen.getByLabelText("First Name"), " Okoye");
    await user.click(getSaveButton());

    await waitFor(() => {
      expect(screen.getByLabelText("Link 1 value")).toHaveFocus();
    });
  });

  it("reorders links through the drag group", async () => {    const { updateProfile } = setupMocks();
    const user = userEvent.setup();
    render(
      <ProfileForm
        initialData={{
          ...INITIAL_DATA,
          link: [
            { tag: "github", value: "a/repo" },
            { tag: "figma", value: "b-id" },
            { tag: "other", value: "https://c.com" },
          ],
        }}
      />,
    );

    // Swap the first two rows through the reorder callback.
    const ids = [...reorder.values];
    await act(async () => {
      reorder.onReorder?.([ids[1], ids[0], ids[2]]);
    });

    await user.type(screen.getByLabelText("First Name"), " Okoye");
    await user.click(getSaveButton());

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledTimes(1);
    });
    expect(
      updateProfile.mock.calls[0][0].links.map(
        (l: { value: string }) => l.value,
      ),
    ).toEqual([
      "https://figma.com/b-id",
      "https://github.com/a/repo",
      "https://c.com",
    ]);
  });
});

describe("ProfileForm basic info", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the saved values", () => {
    setupMocks();
    renderForm();

    expect(screen.getByLabelText("First Name")).toHaveValue("Ada");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Lovelace");
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Phone Numbers")).toHaveValue("+1234567890");
    expect(screen.getByLabelText("City")).toHaveValue("Lagos");
    expect(screen.getByLabelText("Country")).toBeDisabled();
  });

  it("blocks submit when a required field is invalid", async () => {
    const { updateProfile } = setupMocks();
    const { user } = renderForm();

    const firstname = screen.getByLabelText("First Name");
    await user.clear(firstname);
    await user.type(firstname, "A");
    await user.click(getSaveButton());

    await waitFor(() => {
      expect(
        screen.getByText("First name must be at least 2 characters."),
      ).toBeInTheDocument();
    });
    expect(updateProfile).not.toHaveBeenCalled();
  });
});

describe("ProfileForm work experience", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the empty state", () => {
    setupMocks();
    renderForm();

    expect(
      screen.getByText(/no work experience added yet/i),
    ).toBeInTheDocument();
  });

  it("Add Experience appends a row", async () => {
    setupMocks();
    const { user } = renderForm();

    await user.click(screen.getByRole("button", { name: /add experience/i }));

    expect(screen.getByText("Experience 1")).toBeInTheDocument();
  });

  it("'I currently work here' disables the end date", async () => {
    setupMocks();
    const { user } = renderForm();

    await user.click(screen.getByRole("button", { name: /add experience/i }));
    await user.click(screen.getByRole("checkbox"));

    expect(screen.getByLabelText("End Date")).toBeDisabled();
  });

  it("blocks submit when an experience row is incomplete", async () => {
    const { updateProfile, createWorkExp } = setupMocks();
    const { user } = renderForm();

    await user.click(screen.getByRole("button", { name: /add experience/i }));
    await user.click(getSaveButton());

    await waitFor(() => {
      expect(
        screen.getAllByText("Position is required").length,
      ).toBeGreaterThan(0);
    });
    expect(updateProfile).not.toHaveBeenCalled();
    expect(createWorkExp).not.toHaveBeenCalled();
  });
});

describe("ProfileForm skills", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("passes the saved skills to the select", () => {
    setupMocks();
    render(
      <ProfileForm
        initialData={{ ...INITIAL_DATA, skills: ["skill-1", "skill-2"] }}
      />,
    );

    expect(screen.getByTestId("skills-select")).toHaveAttribute(
      "data-value",
      JSON.stringify(["skill-1", "skill-2"]),
    );
  });
});

describe("ProfileForm interests and rate on submit", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("splits interests on commas, trims, drops empties; empty rate becomes null", async () => {
    const { updateProfile } = setupMocks();
    const user = userEvent.setup();
    render(
      <ProfileForm
        initialData={{
          ...INITIAL_DATA,
          interests: " Web Dev , ML ,, Photography ",
        }}
      />,
    );

    await user.type(screen.getByLabelText("First Name"), " Okoye");
    await user.click(getSaveButton());

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledTimes(1);
    });
    expect(updateProfile.mock.calls[0][0].interests).toEqual([
      "Web Dev",
      "ML",
      "Photography",
    ]);
    expect(updateProfile.mock.calls[0][0].rate).toBeNull();
  });
});
