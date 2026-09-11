"use client";
import { Button } from "@hyperbridge/ui";
import { Link2, LinkIcon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { serialNo } from "~/lib/data.helpers";
import type { ProjectLink } from "~/types/models";
import LinkRow from "./link-row";
import type { ProjectFormValues } from "./project-form";

const EMPTY_LINK: ProjectLink = {
  tag: "github",
  value: "",
};

export function LinksSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({ control, name: "link" });

  const isMax = linkFields.length >= 3;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-1 items-center gap-3 text-left">
          <div className="text-brand-primary bg-brand-black-450 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
            <LinkIcon size={15} />
          </div>

          <CardTitle className="text-foreground truncate text-base">
            Links{" "}
            {linkFields.length ? (
              <span className="text-muted-foreground font-thin">
                — {serialNo(linkFields.length)}
              </span>
            ) : null}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {linkFields.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/3 py-8 text-center">
            <Link2 size={24} className="text-foreground/20" />
            <p className="text-foreground/40 text-xs">No links added yet</p>
          </div>
        )}

        {linkFields.length > 0 && (
          <div className="flex flex-col gap-2">
            {linkFields.map((field, lIdx) => (
              <LinkRow
                key={field.id}
                linkIndex={lIdx}
                control={control}
                remove={removeLink}
                error={errors.link?.[lIdx]?.value?.message}
              />
            ))}
          </div>
        )}

        {errors.link?.message && (
          <p className="text-xs font-medium text-red-400">
            {errors.link.message}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          className="w-full"
          disabled={isMax}
          variant={isMax ? "destructive" : "outline"}
          onClick={() => {
            if (!isMax) appendLink(EMPTY_LINK);
          }}
        >
          {isMax ? "Maximum of 3" : "Add link"}
        </Button>
      </CardFooter>
    </Card>
  );
}
