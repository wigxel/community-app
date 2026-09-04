"use client";

import { IconButton, Text } from "@hyperbridge/ui";
import { usePaginatedQuery } from "convex/react";
import { Circle, CircleCheckIcon, MinusIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/convex/_generated/api";
import { useAuthProfile } from "~/hooks/use-auth";
import { safeArray, safeStr } from "~/lib/data.helpers";
import { cn } from "~/lib/utils";

export function GettingStartedWidget() {
  const profile = useAuthProfile();

  const [isExpanded, setIsExpanded] = React.useState(true);

  const { results: projects } = usePaginatedQuery(
    api.project.listProject,
    {},
    { initialNumItems: 1 },
  );

  // Check for Getting Started widget
  const hasShortBio = safeStr(profile?.shortBio).length > 0;
  const hasProjects = projects.length > 0;
  const hasWorkExperience = safeArray(profile?.workExperience).length > 0;

  const steps = [
    {
      id: "bio",
      label: "Add a Short Bio",
      completed: hasShortBio,
      href: "/dashboard/settings/profile",
    },
    {
      id: "projects",
      label: "Add a Project",
      completed: hasProjects,
      href: "/dashboard/projects",
    },
    {
      id: "experience",
      label: "Add Work Experience",
      completed: hasWorkExperience,
      href: "/dashboard/settings/profile",
    },
  ];

  const completedCount = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progress = (completedCount / totalSteps) * 100;
  const isComplete = completedCount === totalSteps;

  // Don't show widget if everything is complete
  if (isComplete) {
    return null;
  }

  const absolutePosition = "end-5 z-190 bottom-5 lg:fixed";
  const boxClassName =
    "bg-brand-black-450 relative w-xs rounded-xl shadow-xl border-none select-none lg:max-w-md";

  const progressButton = (
    <button
      type="button"
      className={cn("z-200 flex items-center gap-2 p-2")}
      onClick={() => setIsExpanded((expanded) => !expanded)}
    >
      <motion.div
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: "20%" },
        }}
        initial={!isExpanded ? "hidden" : "visible"}
        animate={isExpanded ? "hidden" : "visible"}
        className="pl-4"
      >
        <Text variant="body1" className="text-muted-foreground">
          {completedCount} / {totalSteps}
        </Text>
      </motion.div>

      <CircleProgress className="size-8" progress={progress} />
    </button>
  );

  return (
    <>
      {isExpanded ? (
        <motion.div
          layoutId="widget"
          transition={{ duration: 0.2 }}
          className={absolutePosition}
        >
          <Card className={boxClassName}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center justify-between gap-2">
                  <Text variant="p" className="text-foreground font-medium!">
                    ✌️ &nbsp;&nbsp;Almost there,{" "}
                    {safeStr(profile?.firstName, "Partner")}!
                  </Text>
                </CardTitle>

                <IconButton
                  type="button"
                  className="absolute end-0 top-0"
                  onClick={() => setIsExpanded((visible) => !visible)}
                  variant={"unset"}
                >
                  <MinusIcon strokeWidth={1} />
                </IconButton>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {steps.map((step) => {
                  return (
                    <Link
                      key={step.id}
                      href={step.href}
                      className="group flex items-center gap-3 rounded-lg py-1 transition-colors"
                      draggable={false}
                    >
                      {step.completed ? (
                        <CircleCheckIcon
                          strokeWidth={1}
                          className="text-brand-primary h-5 w-5 shrink-0"
                        />
                      ) : (
                        <Circle
                          strokeWidth={1}
                          className="group-hover:text-muted-foreground text-foreground/40 h-5 w-5 shrink-0"
                        />
                      )}
                      <span
                        className={cn(
                          `flex-1 text-sm`,
                          step.completed
                            ? "text-brand-primary line-through"
                            : "text-foreground group-hover:text-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          layoutId="widget"
          transition={{ duration: 0.2 }}
          className={cn(boxClassName, absolutePosition, "z-180 w-[unset]")}
        >
          <div className="opacity-0">{progressButton}</div>
        </motion.div>
      )}

      <div className={absolutePosition}>{progressButton}</div>
    </>
  );
}

type CircleProgressProps = {
  progress: number;
  className: string;
};

function CircleProgress({ progress = 0, className }: CircleProgressProps) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg className={cn("h-12 w-12 -rotate-90", className)} viewBox="0 0 50 50">
      <title>Circlur Progress</title>
      {/* Background circle */}
      <circle
        cx="25"
        cy="25"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-muted-foreground/20"
      />
      {/* Progress circle */}
      <circle
        cx="25"
        cy="25"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="text-brand-primary transition-all duration-300 ease-in-out"
        strokeLinecap="round"
      />
    </svg>
  );
}
