"use client";
import { Calendar, FolderOpen } from "lucide-react";
import React from "react";
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormStateReturn,
  useFormContext,
} from "react-hook-form";
import type z from "zod/v4";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { timelineDate } from "~/lib/validators/schema";
import { DescriptionField } from "../fields/description-field";
import type { ProjectFormValues } from "./project-form";
import TimelineSelect from "./timeline-select";

type TimelineDate = z.infer<typeof timelineDate>;

export function ProjectFormItem() {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();

  const title = watch("title");
  const isProjectOngoing = watch("ongoing");
  const endValue = watch("timeline.end");
  const prevEndRef = React.useRef<TimelineDate | null>(null);

  // Keep prevEnd in sync while not ongoing — form is source of truth
  React.useEffect(() => {
    if (!isProjectOngoing && endValue !== null) {
      prevEndRef.current = endValue;
    }
  }, [isProjectOngoing, endValue]);

  React.useEffect(() => {
    if (isProjectOngoing) {
      setValue("timeline.end", null, { shouldDirty: true });
    } else if (prevEndRef.current) {
      setValue("timeline.end", prevEndRef.current, { shouldDirty: true });
    }
  }, [isProjectOngoing, setValue]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 text-left">
            <div className="text-brand-primary bg-brand-black-450 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
              <FolderOpen size={15} />
            </div>

            <CardTitle className="text-foreground truncate text-base">
              {title || "Project"}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Title & Description */}
        <div className="flex flex-col gap-4">
          <FormField
            name={"title"}
            render={({ field }) => {
              return (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Project name"
                      maxLength={100}
                      className="text-foreground border-white/15 bg-white/5 placeholder:text-white/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <DescriptionField name="description" />
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground mb-1 flex items-center gap-1.5">
            <Calendar size={12} />
            Timeline
          </Label>

          <div className="mb-4 grid grid-cols-1 gap-y-4">
            {(["start", "end"] as const)
              .filter((key) => !(key === "end" && isProjectOngoing))
              .map((key) => (
                <Controller
                  key={key}
                  control={control}
                  name={`timeline.${key}`}
                  render={({ field }) => (
                    <TimelineSelect
                      timeline={key}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              ))}

            {errors.timeline?.end?.message && (
              <p className="text-xs font-medium text-red-400">
                {errors.timeline.end.message}
              </p>
            )}
            {errors.timeline?.start?.message && (
              <p className="text-xs font-medium text-red-400">
                {errors.timeline.start.message}
              </p>
            )}
          </div>

          <div className="mb-3 flex items-center gap-2">
            <Controller
              control={control}
              name="ongoing"
              render={({ field }) => (
                <Checkbox
                  id="ongoing"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
              )}
            />
            <Label
              htmlFor="ongoing"
              className="text-muted-foreground text-xs font-medium"
            >
              I am currently working on this project
            </Label>
          </div>
          {errors.ongoing?.message && (
            <p className="text-xs font-medium text-red-400">
              {errors.ongoing.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
