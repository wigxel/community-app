import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("~/lib/toast", () => ({
  toast,
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import ForgotPasswordForm from "~/app/auth/forgot-password/form";

describe("ForgotPasswordForm", () => {
  afterEach(() => {
    cleanup();
    fetchMock.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
  });

  it("renders email input and submit button", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeDefined();
  });

  it("submits valid email and shows success toast", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const input = screen.getByLabelText(/email/i);
    await user.type(input, "user@example.com");

    const button = screen.getByRole("button", { name: /send reset link/i });
    await user.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/request-password-reset",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "user@example.com",
            redirectTo: "/auth/reset-password",
          }),
        }),
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Check your email for a reset link",
      );
    });
  });

  it("shows error toast on fetch failure and preserves form value", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "Server error" }),
    });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const input = screen.getByLabelText(/email/i);
    await user.type(input, "user@example.com");

    const button = screen.getByRole("button", { name: /send reset link/i });
    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Request failed",
        expect.objectContaining({ description: "Server error" }),
      );
    });

    expect(input).toHaveProperty("value", "user@example.com");
  });
});
