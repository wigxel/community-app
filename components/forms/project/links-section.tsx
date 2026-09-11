"use client";
import { Link2, LinkIcon, Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-1 items-center gap-3 text-left">
          <div className="text-brand-primary bg-brand-black-450 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
            <LinkIcon size={15} />
          </div>

          <CardTitle className="text-foreground truncate text-base">
            Links
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-white/50 uppercase">
            <Link2 size={12} />
            Links
            {linkFields.length > 0 && (
              <Badge
                variant="outline"
                className="ml-1 border-white/20 px-1.5 py-0 text-[10px] text-white/50"
              >
                {linkFields.length}
              </Badge>
            )}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-blue-300/70 hover:bg-blue-500/15 hover:text-blue-200"
            onClick={() => appendLink(EMPTY_LINK)}
          >
            <Plus size={12} />
            Add link
          </Button>
        </div>

        {linkFields.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/3 py-8 text-center">
            <Link2 size={24} className="text-white/20" />
            <p className="text-xs text-white/40">No links added yet</p>
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
    </Card>
  );
}
