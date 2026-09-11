"use client";
import { Calendar, FolderOpen } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
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
import { DescriptionField } from "../fields/description-field";
import type { ProjectFormValues } from "./project-form";
import TimelineSelect from "./timeline-select";

export function ProjectFormItem() {
  const { watch } = useFormContext<ProjectFormValues>();

  const title = watch("title");

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
        <TimelineFields />
      </CardContent>
    </Card>
  );
}

export function TimelineFields() {
  const {
    watch,
    control,
    setValue,
    formState: { defaultValues, errors },
  } = useFormContext<ProjectFormValues>();

  const isProjectOngoing = watch("ongoing");

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground mb-1 flex items-center gap-1.5">
        <Calendar size={12} />
        Timeline
      </Label>

      <div className="mb-4 grid grid-cols-1 gap-y-4">
        {(["start", "end"] as const)
          .filter((key) => !(key === "end" && isProjectOngoing))
          .map((key) => {
            const fieldPath = `timeline.${key}` as const;

            return (
              <FormField
                key={fieldPath}
                name={fieldPath}
                render={({ field, formState }) => {
                  const defaultValue = defaultValues?.timeline?.[key];

                  return (
                    <FormItem>
                      <TimelineSelect
                        timeline={key}
                        value={field.value ?? defaultValue}
                        onChange={(value) => {
                          if (formState.isReady) {
                            setValue(fieldPath, value, { shouldDirty: true });
                          }
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            );
          })}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Controller
          control={control}
          name="ongoing"
          render={({ field, formState }) => (
            <Checkbox
              id="ongoing"
              ref={field.ref}
              checked={field.value}
              onCheckedChange={(checked) => {
                if (formState.isReady) {
                  field.onChange(checked === true);
                }
              }}
            />
          )}
        />
        <Label
          htmlFor="ongoing"
          className="text-muted-foreground text-xs font-medium"
        >
          This is a personal project
        </Label>
      </div>

      {errors.ongoing?.message && (
        <p className="text-xs font-medium text-red-400">
          {errors.ongoing.message}
        </p>
      )}
    </div>
  );
}
