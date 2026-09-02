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
import type { UsernameStatus } from "~/components/onboarding/check-username";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { SegmentProgressBar } from "~/components/ui/segmented-gradient-progress";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { authClient } from "~/lib/auth-client";
import { safeArray, safeStr } from "~/lib/data.helpers";
import { getErrorMessage } from "~/lib/error.helpers";
import { toast } from "~/lib/toast";
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

  const [step, setStep] = useState(4);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

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

  // @todo: zod should handle validation
  const handleNext = () => {
    if (step === 1) {
      if (usernameStatus === "checking") {
        toast.warning("Please wait while we check username availability");
        return;
      }

      if (usernameStatus !== "available") {
        form.setError("username", {
          message: "Please choose a valid and available username",
        });
        return;
      }
    }

    if (step === 4) {
      const { interests } = form.getValues();
      if (interests.length === 0) {
        form.setError("interests", {
          message: "Select at least one interest",
        });
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
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

  // @todo: The next and previous buttons should be contained in each step
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

        {step === 1 && (
          <BasicInfoStep
            form={form}
            onUsernameStatusChange={setUsernameStatus}
          />
        )}
        {step === 2 && <AvatarStep form={form} />}
        {step === 3 && <RoleStep form={form} titles={titles} />}
        {step === 4 && <InterestsStep />}

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={form.formState.isSubmitting}
              className="flex-1"
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && usernameStatus !== "available"}
              variant="default"
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              variant="default"
              className="flex-1"
            >
              {form.formState.isSubmitting
                ? "Creating Profile..."
                : "Complete Setup"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
