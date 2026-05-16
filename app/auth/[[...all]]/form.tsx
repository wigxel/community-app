"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { z } from "zod/v4";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth-client";

type SignInState = {
  error?: string;
  success?: boolean;
  timestamp: number;
};

type SignUpState = {
  error?: string;
  success?: boolean;
  timestamp: number;
};

const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { timestamp: Date.now(), error: parsed.error.issues[0].message };
  }

  const { error } = await authClient.signIn.email(parsed.data);
  if (error)
    return { timestamp: Date.now(), error: error.message ?? "Sign in failed" };

  return { timestamp: Date.now(), success: true };
}

async function signUpAction(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { timestamp: Date.now(), error: parsed.error.issues[0].message };
  }

  const { error } = await authClient.signUp.email({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.email.split("@")[0], // Better auth requires a name by default
  });

  if (error)
    return { timestamp: Date.now(), error: error.message ?? "Sign up failed" };

  return {
    timestamp: Date.now(),
    success: true,
  };
}

export default function AuthForm({
  redirectTo,
  defaultMode,
}: {
  redirectTo: string;
  defaultMode: "sign-in" | "sign-up";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">(defaultMode);

  const [signInState, signInAction_, signInPending] = useActionState<
    SignInState,
    FormData
  >(signInAction, { timestamp: 0 });

  const [signUpState, signUpAction_, signUpPending] = useActionState<
    SignUpState,
    FormData
  >(signUpAction, { timestamp: 0 });

  useEffect(() => {
    if (signInState.success) {
      router.push(redirectTo);
    }
  }, [signInState.success, redirectTo, router]);

  useEffect(() => {
    if (signUpState.success) {
      window.location.href = `/onboarding?redirect=${encodeURIComponent(redirectTo)}`;
    }
  }, [signUpState.success, redirectTo]);

  const switchMode = (next: "sign-in" | "sign-up") => {
    setMode(next);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex mb-6 rounded-xl overflow-hidden border border-white/10">
          <button
            type="button"
            onClick={() => switchMode("sign-in")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === "sign-in"
                ? "bg-blue-500 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("sign-up")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === "sign-up"
                ? "bg-blue-500 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
          {mode === "sign-in" ? (
            <form action={signInAction_} className="flex flex-col gap-4">
              {signInState.error && (
                <p className="text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                  {signInState.error}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={signInPending}
                className="mt-1 w-full"
              >
                {signInPending ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          ) : (
            <form action={signUpAction_} className="flex flex-col gap-4">
              {signUpState.error && (
                <p className="text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                  {signUpState.error}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email-up">Email</Label>
                <Input
                  id="email-up"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password-up">Password</Label>
                <Input
                  id="password-up"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="min. 8 characters"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password-up">Confirm Password</Label>
                <Input
                  id="confirm-password-up"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                />
              </div>

              <Button
                type="submit"
                disabled={signUpPending}
                className="mt-1 w-full"
              >
                {signUpPending ? "Creating account…" : "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
