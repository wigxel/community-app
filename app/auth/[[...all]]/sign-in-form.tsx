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

type SignInState = {
  error?: string;
  success?: boolean;
  timestamp: number;
};

const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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

export default function SignInForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const [state, action, pending] = useActionState<SignInState, FormData>(
    signInAction,
    { timestamp: 0 },
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Welcome back!");
      router.push(redirectTo);
    }
  }, [state.success, redirectTo, router]);

  return (
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
          disabled={pending}
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      <Button type="submit" disabled={pending} className="mt-1 w-full">
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
