"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  CheckUsername,
  type UsernameStatus,
} from "~/components/onboarding/check-username";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { toast } from "~/lib/toast";
import type { Stepper } from "../_components/step-controls";
import { StepControls } from "../_components/step-controls";
import type { OnboardingValues } from "../form";

export type BasicInfoStepProps = {
  form: UseFormReturn<OnboardingValues>;
  stepper: Stepper;
};

export function BasicInfoStep(props: BasicInfoStepProps) {
  const { form, stepper } = props;

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const handleNext = async () => {
    if (usernameStatus === "checking") {
      toast.warning("Please wait while we check username availability");
      return;
    }

    const ok = await form.trigger(["firstName", "lastName", "username"]);
    if (!ok) return;

    if (usernameStatus !== "available") return;

    stepper.next();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 text-xl font-semibold">Basic Information</h2>
        <p className="text-sm text-white/60">Tell us about yourself</p>
      </div>

      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>First name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Jane"
                disabled={form.formState.isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Last name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Doe"
                disabled={form.formState.isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <CheckUsername
        value={form.watch("username")}
        onChange={(v) => form.setValue("username", v, { shouldDirty: true })}
        onStatusChange={setUsernameStatus}
      />

      <StepControls
        stepper={stepper}
        onNext={handleNext}
        nextDisabled={usernameStatus !== "available"}
      />
    </div>
  );
}
