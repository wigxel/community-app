import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { mockUseQuery } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("~/components/auth/require-auth-dialog", () => ({
  default: ({ onSignedIn }: { onSignedIn: () => void }) => (
    <div data-testid="auth-dialog">
      <button data-testid="mock-signed-in" onClick={onSignedIn} type="button">
        done
      </button>
    </div>
  ),
}));

import { RequireAuth } from "~/components/auth/require-auth";

function renderWithChild(onChildClick: () => void) {
  const user = userEvent.setup();
  render(
    <RequireAuth>
      <button data-testid="child" onClick={onChildClick} type="button">
        like
      </button>
    </RequireAuth>,
  );
  return { user };
}

describe("RequireAuth", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("passes clicks through when signed in", async () => {
    mockUseQuery.mockReturnValue({ _id: "profile-1" });
    const onChildClick = vi.fn();
    const { user } = renderWithChild(onChildClick);
    await user.click(screen.getByTestId("child"));
    expect(onChildClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("auth-dialog")).toBeNull();
  });

  it("blocks the child and opens the dialog, closing on sign-in", async () => {
    mockUseQuery.mockReturnValue(null);
    const onChildClick = vi.fn();
    const { user } = renderWithChild(onChildClick);
    await user.click(screen.getByTestId("child"));
    expect(onChildClick).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId("auth-dialog")).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("mock-signed-in"));
    await waitFor(() => {
      expect(screen.queryByTestId("auth-dialog")).toBeNull();
    });
  });

  it("swallows clicks while auth is loading", async () => {
    mockUseQuery.mockReturnValue(undefined);
    const onChildClick = vi.fn();
    const { user } = renderWithChild(onChildClick);
    await user.click(screen.getByTestId("child"));
    expect(onChildClick).not.toHaveBeenCalled();
    expect(screen.queryByTestId("auth-dialog")).toBeNull();
  });
});
