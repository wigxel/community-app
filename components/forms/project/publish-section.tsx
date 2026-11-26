"use client";
import { Globe } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import type { ProjectFormValues } from "./project-form";

export function PublishSection() {
  const { control } = useFormContext<ProjectFormValues>();

  return (
    <Card>
      <CardContent>
        <Controller
          control={control}
          name="published"
          render={({ field }) => (
            // The whole card toggles: the row is a <label> for the checkbox,
            // so clicks anywhere in it reach the control. Spans instead of
            // divs — labels only accept phrasing content.
            <Label
              htmlFor="project-public"
              className="flex cursor-pointer items-center justify-between gap-4 font-normal"
            >
              <span className="flex flex-1 items-center gap-3 text-left">
                <span className="text-brand-primary bg-brand-black-450 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                  <Globe size={15} />
                </span>

                <span className="flex flex-col gap-1">
                  <span className="text-foreground text-base leading-none font-medium">
                    Visibility
                  </span>
                  <span className="text-muted-foreground max-w-[60ch] text-sm leading-snug text-balance">
                    Show this project on the public site. Unpublished projects
                    are hidden everywhere.
                  </span>
                </span>
              </span>

              <Checkbox
                id="project-public"
                ref={field.ref}
                className="cursor-pointer"
                // `!== false` so legacy rows with no `published` field show checked.
                checked={field.value !== false}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            </Label>
          )}
        />
      </CardContent>
    </Card>
  );
}
