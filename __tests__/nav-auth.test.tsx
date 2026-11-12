import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { useSession, mockUseQuery, signOut, push } = vi.hoisted(() => ({
  useSession: vi.fn(),
  mockUseQuery: vi.fn(),
  signOut: vi.fn(),
  push: vi.fn(),
}));

vi.mock("~/lib/auth-client", () => ({
  authClient: { useSession, signOut },
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import NavAuth from "~/app/_components/NavAuth";

const LOADING_SESSION = { data: null, isPending: true };
const ANONYMOUS_SESSION = { data: null, isPending: false };
const AUTHENTICATED_SESSION = {
  data: { user: { name: "Nightmore" } },
  isPending: false,
};

const PROFILE = { firstName: "Nightmore", lastName: "Doe" };

function menuItemHref(name: string) {
  return screen
    .getByRole("menuitem", { name })
    .closest("a")
    ?.getAttribute("href");
}

describe("NavAuth", () => {
  afterEach(() => {
    cleanup();
    useSession.mockReset();
    mockUseQuery.mockReset();
    signOut.mockReset();
    push.mockReset();
  });

  it("shows a loading placeholder while the session is loading", () => {
    useSession.mockReturnValue(LOADING_SESSION);
    mockUseQuery.mockReturnValue(null);

    render(<NavAuth />);

    expect(screen.getByRole("status")).toBeDefined();
    expect(screen.queryByText("Sign in")).toBeNull();
    expect(screen.queryByText("Sign up")).toBeNull();
  });

  it("renders auth actions after an unauthenticated session resolves", () => {
    useSession.mockReturnValue(ANONYMOUS_SESSION);
    mockUseQuery.mockReturnValue(null);

    render(<NavAuth />);

    const signIn = screen.getByRole("link", { name: "Sign in" });
    const signUp = screen.getByRole("link", { name: "Sign up" });

    expect(signIn.getAttribute("href")).toBe("/auth/sign-in");
    expect(signUp.getAttribute("href")).toBe("/auth/sign-up");
  });

  it("renders the profile initial for an authenticated session", () => {
    useSession.mockReturnValue(AUTHENTICATED_SESSION);
    mockUseQuery.mockReturnValue(PROFILE);

    render(<NavAuth />);

    const trigger = screen.getByRole("button", { name: "Open account menu" });

    expect(within(trigger).getByText("N")).toBeDefined();
    expect(screen.queryByText("Sign in")).toBeNull();
  });

  it("opens the account menu with links and signs out", async () => {
    const user = userEvent.setup();
    useSession.mockReturnValue(AUTHENTICATED_SESSION);
    mockUseQuery.mockReturnValue(PROFILE);
    signOut.mockResolvedValue({ error: null });

    render(<NavAuth />);

    await user.click(screen.getByRole("button", { name: "Open account menu" }));
    await screen.findByRole("menuitem", { name: "Account" });

    expect(menuItemHref("Account")).toBe("/dashboard");
    expect(menuItemHref("Settings")).toBe("/dashboard/settings/profile");

    await user.click(screen.getByRole("menuitem", { name: "Logout" }));

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith("/");
  });
});
