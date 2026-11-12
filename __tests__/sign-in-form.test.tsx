import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { mockSignInEmail, mockPush } = vi.hoisted(() => ({
  mockSignInEmail: vi.fn(),
  mockPush: vi.fn(),
}));

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("~/lib/auth-client", () => ({
  authClient: {
    signIn: { email: (...args: unknown[]) => mockSignInEmail(...args) },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("~/lib/toast", () => ({ toast }));

import SignInForm from "~/app/auth/sign-in/form";

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByPlaceholderText("you@example.com"),
    "user@example.com",
  );
  await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));
}

describe("SignInForm onSuccess", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("calls onSuccess instead of navigating on success", async () => {
    mockSignInEmail.mockResolvedValue({ error: null });
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<SignInForm redirectTo="/projects/p1" onSuccess={onSuccess} />);
    await fillAndSubmit(user);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigates when onSuccess is absent", async () => {
    mockSignInEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<SignInForm redirectTo="/projects/p1" />);
    await fillAndSubmit(user);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/projects/p1"));
  });
});
