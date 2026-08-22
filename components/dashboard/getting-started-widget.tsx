"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/convex/_generated/api";
import { safeArray, safeStr } from "~/lib/data.helpers";
import { Badge } from "../ui/badge";
import { SegmentProgressBar } from "../ui/segmented-gradient-progress";

export function GettingStartedWidget() {
  const profile = useQuery(api.profiles.getProfile);
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

  return (
    <Card className="lg:fixed bottom-0 right-0 lg:max-w-md bg-gray-800 border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white flex justify-between items-center gap-2">
              Almost There!
              <Badge variant={"secondary"} className="tabular-nums">
                {Math.round(progress)}%
              </Badge>
            </CardTitle>
            <p className="text-sm text-white/60 text-balance mt-1">
              Complete the remaining steps in the checklist before going live.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <SegmentProgressBar
          gradient={{ startColor: "#1f4fee", endColor: "#32aaf9" }}
          progressValue={progress}
        />

        <div className="space-y-2">
          {steps.map((step) => (
            <Link
              key={step.id}
              href={step.href}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            >
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-white/40 shrink-0 group-hover:text-white/60" />
              )}
              <span
                className={`flex-1 text-sm ${
                  step.completed
                    ? "text-white/60 line-through"
                    : "text-white group-hover:text-white"
                }`}
              >
                {step.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
