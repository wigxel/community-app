"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod/v4";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth-client";

type ResetPasswordState = {
  error?: string;
  success?: boolean;
  timestamp: number;
};

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function makeResetAction(token: string) {
  return async function resetPasswordAction(
    _prev: ResetPasswordState,
    formData: FormData,
  ): Promise<ResetPasswordState> {
    const raw = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return { timestamp: Date.now(), error: parsed.error.issues[0].message };
    }

    const { error } = await authClient.resetPassword({
      newPassword: parsed.data.password,
      token,
    });

    if (error) {
      return {
        timestamp: Date.now(),
        error: error.message ?? "Something went wrong",
      };
    }

    return { timestamp: Date.now(), success: true };
  };
}

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();

  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(
    makeResetAction(token),
    { timestamp: 0 },
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Password reset! Please sign in.");
      router.push("/auth");
    }
  }, [state.success, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-white mb-2">
            Reset your password
          </h1>
          <p className="text-sm text-white/50 mb-6">
            Choose a new password for your account.
          </p>

          <form action={action} className="flex flex-col gap-4">
            {state.error && (
              <p className="text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                {state.error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={pending}
                minLength={8}
                autoComplete="new-password"
                placeholder="min. 8 characters"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={pending}
                minLength={8}
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
            </div>

            <Button type="submit" disabled={pending} className="mt-1 w-full">
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset password"
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
        </div>
      </div>
    </div>
  );
}
