"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation as useTMutation } from "@tanstack/react-query";
import { useMutation, useQuery } from "convex/react";
import { pipe, String as Str } from "effect";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { Form } from "~/components/ui/form";
import { SegmentProgressBar } from "~/components/ui/segmented-gradient-progress";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { authClient } from "~/lib/auth-client";
import { safeArray, safeStr } from "~/lib/data.helpers";
import { getErrorMessage } from "~/lib/error.helpers";
import { toast } from "~/lib/toast";
import type { Stepper } from "./_components/step-controls";
import { AvatarStep } from "./steps/avatar-step";
import { BasicInfoStep } from "./steps/basic-info-step";
import { InterestsStep } from "./steps/interests-step";
import { RoleStep } from "./steps/role-step";

export const onboardingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, - and _ allowed"),
  profileImage: z.string().optional(),
  title: z.string().optional(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

const defaultState: OnboardingValues = {
  firstName: "",
  lastName: "",
  username: "",
  profileImage: "",
  title: "",
  interests: [],
};

export type OnboardingFormProps = {
  redirectTo: string;
};

export default function OnboardingForm(props: OnboardingFormProps) {
  const { redirectTo } = props;

  const router = useRouter();
  const createProfile = useMutation(api.profiles.createProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const titles = useQuery(api.titles.listTitles) ?? [];
  const formRef = useRef<HTMLFormElement>(null);

  const [step, setStep] = useState(1);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: defaultState,
    mode: "onBlur",
  });

  const progress = (step / 4) * 100;
  const accountDetails = useTMutation({
    mutationFn: () => authClient.getSession(),
    onSuccess: (result) => {
      const [firstname, ...lastname] = pipe(
        safeStr(result?.data?.user?.name),
        Str.split(" "),
      );

      form.setValue("firstName", firstname);
      form.setValue("lastName", safeArray(lastname).join(" "));
    },
  });

  const stepper: Stepper = {
    step,
    totalSteps: 4,
    next: () => setStep((s) => Math.min(s + 1, 4)),
    back: () => setStep((s) => Math.max(s - 1, 1)),
  };

  async function onSubmit(values: OnboardingValues) {
    try {
      await createProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username.toLowerCase(),
      });

      await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumbers: [],
        title: values.title ? (values.title as Id<"titles">) : null,
        profileImage: values.profileImage || null,
        interests: values.interests,
      });

      if (
        process.env.NEXT_PUBLIC_POSTHOG_KEY &&
        process.env.NEXT_PUBLIC_POSTHOG_HOST
      ) {
        posthog.capture("onboarding_completed", {
          has_profile_image: Boolean(values.profileImage),
          has_title: Boolean(values.title),
          interest_count: values.interests.length,
        });
      }
      toast.success("Profile created!", {
        description: "Redirecting to dashboard...",
      });
      router.push(redirectTo);
    } catch (err) {
      toast.error("Profile creation failed", {
        description: getErrorMessage(err) || "Something went wrong",
      });
    }
  }

  useEffect(() => {
    setTimeout(() => {
      accountDetails.mutateAsync().catch(() => {});
    }, 2000);
  }, [accountDetails.mutateAsync]);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="space-y-2">
          <div className="text-muted-foreground flex justify-between text-sm">
            <span className="font-medium">Step {step} of 4</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 overflow-hidden">
            <SegmentProgressBar progressValue={progress} />
          </div>
        </div>

        {step === 1 && <BasicInfoStep form={form} stepper={stepper} />}
        {step === 2 && <AvatarStep form={form} stepper={stepper} />}
        {step === 3 && (
          <RoleStep form={form} titles={titles} stepper={stepper} />
        )}
        {step === 4 && <InterestsStep form={form} stepper={stepper} />}
      </form>
    </Form>
  );
}
