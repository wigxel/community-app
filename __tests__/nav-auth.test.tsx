import { cleanup, render, screen } from "@testing-library/react";

const { useSession } = vi.hoisted(() => ({ useSession: vi.fn() }));

vi.mock("~/lib/auth-client", () => ({
  authClient: { useSession },
}));

import NavAuth from "~/app/_components/NavAuth";

describe("NavAuth", () => {
  afterEach(() => {
    cleanup();
    useSession.mockReset();
  });

  it("renders no auth actions while the session is loading", () => {
    useSession.mockReturnValue({ data: null, isPending: true });

    render(<NavAuth />);

    expect(screen.queryByText("Sign In")).toBeNull();
    expect(screen.queryByText("Sign Up")).toBeNull();
  });

  it("renders auth actions after an unauthenticated session resolves", () => {
    useSession.mockReturnValue({ data: null, isPending: false });

    render(<NavAuth />);

    expect(screen.getByText("Sign In").getAttribute("href")).toBe("/auth");
    expect(screen.getByText("Sign Up").getAttribute("href")).toBe(
      "/auth?mode=sign-up",
    );
  });

  it("renders the user dashboard link for an authenticated session", () => {
    useSession.mockReturnValue({
      data: { user: { name: "Nightmore" } },
      isPending: false,
    });

    render(<NavAuth />);

    expect(screen.queryByText("Sign In")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Go to dashboard" }).textContent,
    ).toBe("N");
  });
});
