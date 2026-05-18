"use client";

import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

interface GettingStartedWidgetProps {
  hasShortBio: boolean;
  hasProjects: boolean;
  hasWorkExperience: boolean;
}

export function GettingStartedWidget({
  hasShortBio,
  hasProjects,
  hasWorkExperience,
}: GettingStartedWidgetProps) {
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
      href: "/dashboard/settings/profile",
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
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              Almost There!
              <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-blue-300 text-black">
                {Math.round(progress)}%
              </span>
            </CardTitle>
            <p className="text-sm text-white/60 mt-1">
              Complete the remaining steps in the checklist before going live.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex gap-1">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < completedCount
                    ? "bg-gradient-to-r from-blue-200 to-blue-400"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {steps.map((step) => (
            <Link
              key={step.id}
              href={step.href}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            >
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-white/40 flex-shrink-0 group-hover:text-white/60" />
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

        <Link href="/dashboard/settings/profile">
          <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            Go to checklist
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
