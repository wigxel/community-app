import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { toast, useRouter } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("~/lib/toast", () => ({ toast }));
vi.mock("next/navigation", () => ({ useRouter }));

const resetPasswordMock = vi.fn();
vi.mock("~/lib/auth-client", () => ({
  authClient: {
    resetPassword: (...args: unknown[]) => resetPasswordMock(...args),
  },
}));

import ResetPasswordForm from "~/app/auth/reset-password/form";

describe("ResetPasswordForm", () => {
  afterEach(() => {
    cleanup();
    resetPasswordMock.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
  });

  it("renders password inputs and submit button", () => {
    render(<ResetPasswordForm token="test-token" />);

    expect(screen.getByLabelText(/new password/i)).toBeDefined();
    expect(screen.getByLabelText(/confirm password/i)).toBeDefined();
    expect(
      screen.getByRole("button", { name: /reset password/i }),
    ).toBeDefined();
  });

  it("submits valid passwords and shows success toast", async () => {
    resetPasswordMock.mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    render(<ResetPasswordForm token="test-token" />);

    const password = screen.getByLabelText(/new password/i);
    const confirm = screen.getByLabelText(/confirm password/i);
    await user.type(password, "ValidPass1!");
    await user.type(confirm, "ValidPass1!");

    const button = screen.getByRole("button", { name: /reset password/i });
    await user.click(button);

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith({
        newPassword: "ValidPass1!",
        token: "test-token",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Password reset! Please sign in.",
      );
    });
  });

  it("shows error toast on API failure and preserves form values", async () => {
    resetPasswordMock.mockResolvedValueOnce({
      error: { message: "Invalid token" },
    });
    const user = userEvent.setup();
    render(<ResetPasswordForm token="bad-token" />);

    const password = screen.getByLabelText(/new password/i);
    const confirm = screen.getByLabelText(/confirm password/i);
    await user.type(password, "ValidPass1!");
    await user.type(confirm, "ValidPass1!");

    const button = screen.getByRole("button", { name: /reset password/i });
    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Reset failed",
        expect.objectContaining({ description: "Invalid token" }),
      );
    });

    expect(password).toHaveProperty("value", "ValidPass1!");
    expect(confirm).toHaveProperty("value", "ValidPass1!");
  });
});
