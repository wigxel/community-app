"use client";
import { Calendar, FolderOpen } from "lucide-react";
import React, { Fragment } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { LinksSection } from "./links-section";
import { MediaSection } from "./media-section";
import type { ProjectFormValues } from "./project-form";
import TimelineSelect from "./timeline-select";

export function ProjectFormItem() {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();

  const title = watch("title");
  const ongoing = watch("ongoing");

  React.useEffect(() => {
    if (ongoing) setValue("timeline.end", null);
  }, [ongoing, setValue]);

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

      <CardContent className="flex flex-col gap-6 pt-0">
        <Separator className="bg-white/10" />

        {/* Title & Description */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="title"
              className="text-foreground/50 text-xs font-semibold tracking-widest uppercase after:ml-0.5 after:content-['*']"
            >
              Title
            </Label>
            <Input
              {...register("title")}
              id="title"
              placeholder="Project name"
              maxLength={100}
              className="text-foreground border-white/15 bg-white/5 placeholder:text-white/30"
            />
            {errors.title?.message && (
              <p className="text-xs font-medium text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="description"
              className="text-foreground/50 text-xs font-semibold tracking-widest uppercase"
            >
              Description
            </Label>
            <div className="relative">
              <Textarea
                {...register("description")}
                id="description"
                placeholder="What did you build or work on?"
                rows={3}
                maxLength={300}
                className="text-foreground resize-none border-white/15 bg-white/5 placeholder:text-white/30"
              />
              <span className="text-foreground/30 absolute right-3 bottom-2 text-[10px]">
                {watch("description")?.length ?? 0}/300
              </span>
            </div>
            {errors.description?.message && (
              <p className="text-xs font-medium text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-foreground/50 mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase">
            <Calendar size={12} />
            Timeline
          </Label>

          <div className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="ongoing"
              {...register("ongoing")}
              className="accent-blue-400"
            />
            <Label
              htmlFor="ongoing"
              className="text-foreground/50 text-xs font-medium"
            >
              I am currently working on this project
            </Label>
          </div>

          <div className="flex items-center divide-x divide-white/15 *:w-full *:px-5 [&>*:first-child]:pl-0 [&>*:last-child]:pr-0">
            {(["start", "end"] as const)
              .filter((key) => !(key === "end" && ongoing))
              .map((key) => (
                <Fragment key={key}>
                  <Controller
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
                </Fragment>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
