"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { z } from "zod/v4";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth-client";

type SignUpState = {
  error?: string;
  success?: boolean;
  timestamp: number;
};

const signUpSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

async function signUpAction(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
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
    name: `${parsed.data.firstName} ${parsed.data.lastName}`,
  });

  if (error)
    return { timestamp: Date.now(), error: error.message ?? "Sign up failed" };

  return { timestamp: Date.now(), success: true };
}

export default function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState<SignUpState, FormData>(
    signUpAction,
    {
      timestamp: 0,
    },
  );

  useEffect(() => {
    if (state.success) {
      window.location.href = `/onboarding?redirect=${encodeURIComponent(redirectTo)}`;
    }
  }, [state.success, redirectTo]);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <p className="text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="first-name">First Name</Label>
          <Input
            id="first-name"
            name="firstName"
            type="text"
            required
            disabled={pending}
            placeholder="John"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="last-name">Last Name</Label>
          <Input
            id="last-name"
            name="lastName"
            type="text"
            required
            disabled={pending}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email-up">Email</Label>
        <Input
          id="email-up"
          name="email"
          type="email"
          required
          disabled={pending}
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
          disabled={pending}
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
            Creating account…
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
