"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { z } from "zod/v4";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createProfileAction } from "./actions";

type OnboardingState = {
  error?: string;
  success?: boolean;
  timestamp: number;
};

const onboardingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, - and _ allowed"),
});

async function submitOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    username: (formData.get("username") as string).toLowerCase(),
  };

  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return { timestamp: Date.now(), error: parsed.error.issues[0].message };
  }

  try {
    await createProfileAction({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      username: parsed.data.username,
    });
  } catch (err: unknown) {
    return {
      timestamp: Date.now(),
      error: err instanceof Error ? err.message : "Profile creation failed",
    };
  }

  return {
    timestamp: Date.now(),
    success: true,
  };
}

export default function OnboardingForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const [state, submitAction, isPending] = useActionState<
    OnboardingState,
    FormData
  >(submitOnboarding, { timestamp: 0 });

  useEffect(() => {
    if (state.success) {
      router.push(redirectTo);
    }
  }, [state.success, redirectTo, router]);

  return (
    <form action={submitAction} className="flex flex-col gap-5 mt-6">
      {state.error && (
        <p className="text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            required
            autoComplete="given-name"
            placeholder="Jane"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            required
            autoComplete="family-name"
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          required
          autoComplete="username"
          placeholder="janedoe"
        />
        <p className="text-xs text-white/50">
          This will be your unique identifier.
        </p>
      </div>

      <Button type="submit" disabled={isPending} className="mt-4 w-full">
        {isPending ? "Setting up profile…" : "Complete Onboarding"}
      </Button>
    </form>
  );
}
