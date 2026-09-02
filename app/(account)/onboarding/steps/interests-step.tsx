import { PlusIcon, X, XIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { OnboardingFormSchema } from "../shared";
import { safeArray, safeStr } from "~/lib/data.helpers";
import { cn } from "~/lib/utils";
import { useMediaQuery } from "hooks-ts";
import { Button, IconButton } from "@hyperbridge/ui";

// @todo: interests should be wired to backend. I believe there's a existing component
// for this already
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

export function InterestsStep() {
  const isMobile = useMediaQuery("(max-width: 768px)") ?? true;
  const form = useForm<OnboardingFormSchema>();
  const [customInterest, setCustomInterest] = React.useState("");

  const [localInterests, setLocalInterests] = React.useState(() => {
    const interests = safeArray(form.watch("interests"));
    return new Set([...interests, ...COMMON_INTERESTS]);
  });
  const [selectedInterest, setSelectedInterest] = React.useState(
    () => new Set(),
  );

  const toggleInterest = (interest: string) => {
    if (selectedInterest.has(interest)) {
      selectedInterest.delete(interest);
    } else {
      selectedInterest.add(interest);
    }

    setSelectedInterest(new Set(selectedInterest));
  };

  const addCustomInterest = () => {
    const trimmed = safeStr(customInterest)
      .split(",")
      .map((interest_str) => interest_str.trim())
      .filter((interest_str) => interest_str);

    setLocalInterests(new Set([...localInterests, ...trimmed]));
    setCustomInterest("");

    for (const interest of trimmed) {
      toggleInterest(interest);
    }
  };

  const removeInterest = (interest: string) => {
    localInterests.delete(interest);
    setLocalInterests(new Set(localInterests));
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
                isMobile
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

      <FormField
        control={form.control}
        name="customInterests"
        render={() => {
          return (
            <FormItem className="flex flex-col gap-2">
              <FormLabel>Add Custom Interest</FormLabel>
              <div className="relative flex items-center gap-2">
                <Input
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
                  variant={"level_1"}
                >
                  <PlusIcon size="1em" />
                </IconButton>
              </div>
            </FormItem>
          );
        }}
      />
    </div>
  );
}
