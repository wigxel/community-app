"use client";

import { IconButton } from "@hyperbridge/ui";
import { PlusIcon } from "lucide-react";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { safeStr } from "~/lib/data.helpers";
import { cn } from "~/lib/utils";
import type { Stepper } from "../_components/step-controls";
import { StepControls } from "../_components/step-controls";
import type { OnboardingValues } from "../form";

const COMMON_INTERESTS = [
  "Web Development",
  "Mobile Development",
  "Machine Learning",
  "Data Science",
  "UI/UX Design",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "Blockchain",
  "Game Development",
  "Photography",
  "Writing",
  "Music",
  "Sports",
  "Travel",
  "Reading",
];

export type InterestsStepProps = {
  form: UseFormReturn<OnboardingValues>;
  stepper: Stepper;
};

export function InterestsStep(props: InterestsStepProps) {
  const { form, stepper } = props;

  const interests = form.watch("interests") ?? [];
  const selectedInterest = React.useMemo(() => new Set(interests), [interests]);

  const [customInterest, setCustomInterest] = React.useState("");
  // ponytail: pool derived from COMMON + form values; add form field `interestsPool` if custom deselected chips must survive remount without being selected
  const [localInterests, setLocalInterests] = React.useState(
    () => new Set([...COMMON_INTERESTS, ...interests]),
  );

  const toggleInterest = (interest: string) => {
    const next = new Set(interests);
    if (next.has(interest)) {
      next.delete(interest);
    } else {
      next.add(interest);
    }
    form.setValue("interests", [...next], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const addCustomInterest = () => {
    const trimmed = safeStr(customInterest)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (trimmed.length === 0) return;

    setLocalInterests(new Set([...localInterests, ...trimmed]));
    setCustomInterest("");

    const next = new Set(interests);
    for (const interest of trimmed) next.add(interest);
    form.setValue("interests", [...next], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeInterest = (interest: string) => {
    const nextPool = new Set(localInterests);
    nextPool.delete(interest);
    setLocalInterests(nextPool);

    const next = new Set(interests);
    next.delete(interest);
    form.setValue("interests", [...next], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const presetInterestSet = React.useMemo(() => new Set(COMMON_INTERESTS), []);
  const choices = React.useMemo(
    () => Array.from(localInterests),
    [localInterests],
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 text-xl font-semibold">Your Interests</h2>
        <p className="text-muted-foreground text-sm">
          Select at least one interest
        </p>
      </div>

      <div className="group flex flex-wrap gap-2">
        {choices.map((interest) => {
          const isPreset = presetInterestSet.has(interest);
          const isActive = selectedInterest.has(interest);

          return (
            <button
              key={interest}
              type="button"
              onClick={() => {
                if (isPreset) {
                  toggleInterest(interest);
                } else {
                  removeInterest(interest);
                }
              }}
              className={cn(
                "inline-flex cursor-pointer items-center rounded-full border px-4 py-2 text-sm transition-all",
                selectedInterest.size === 0
                  ? isActive
                    ? "border-brand-primary text-foreground"
                    : "bg-muted text-muted-foreground font-normal hover:bg-white/20"
                  : isActive
                    ? "text-foreground"
                    : "bg-background/50 group-hover:text-muted-foreground font-normal text-transparent hover:bg-white/20",
              )}
            >
              {interest}{" "}
              <PlusIcon
                size="1em"
                className={cn("transition-default ms-2 transform opacity-50", {
                  "rotate-45": isActive,
                })}
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="custom-interest" className="text-sm font-medium">
          Add Custom Interest
        </label>
        <div className="relative flex items-center gap-2">
          <Input
            id="custom-interest"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomInterest();
              }
            }}
            placeholder="e.g., Cooking, Gardening"
          />
          <IconButton
            size="sm"
            rounded="full"
            onClick={addCustomInterest}
            className="absolute end-1 z-20"
            variant="level_1"
          >
            <PlusIcon size="1em" />
          </IconButton>
        </div>
      </div>

      <FormField
        control={form.control}
        name="interests"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />

      <StepControls
        stepper={stepper}
        isSubmit
        isSubmitting={form.formState.isSubmitting}
      />
    </div>
  );
}
