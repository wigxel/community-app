"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod/v4";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type ForgotPasswordState = {
  error?: string;
  success?: boolean;
  timestamp: number;
};

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const raw = { email: formData.get("email") as string };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { timestamp: Date.now(), error: parsed.error.issues[0].message };
  }

  const response = await fetch("/api/auth/request-password-reset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: parsed.data.email,
      redirectTo: "/auth/reset-password",
    }),
  });

  if (!response.ok) {
    let errorMessage = `Server responded with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Use default error message if JSON parsing fails
    }
    return {
      timestamp: Date.now(),
      error: errorMessage,
    };
  }

  return { timestamp: Date.now(), success: true };
}

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<
    ForgotPasswordState,
    FormData
  >(forgotPasswordAction, { timestamp: 0 });

  useEffect(() => {
    if (state.success) {
      toast.success("Check your email for a reset link");
    }
  }, [state.success]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-white mb-2">
            Forgot password?
          </h1>
          <p className="text-sm text-white/50 mb-6">
            Enter your email and we'll send you a reset link.
          </p>

          {state.success ? (
            <p className="text-sm text-green-400 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2">
              Reset link sent! Check your inbox.
            </p>
          ) : (
            <form action={action} className="flex flex-col gap-4">
              {state.error && (
                <p className="text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                  {state.error}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={pending}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <Button type="submit" disabled={pending} className="mt-1 w-full">
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>

              <div className="text-center">
                <a
                  href="/auth"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Back to sign in
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
