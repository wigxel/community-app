"use client";
import { Button } from "@hyperbridge/ui";
import { FileVideoIcon, ImageIcon, Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Media } from "~/types/models";
import MediaRow from "./media-row";
import type { ProjectFormValues } from "./project-form";

const EMPTY_MEDIA: Media = {
  type: "photo",
  metadata: {
    url: "",
    filename: "",
    mimeType: "",
    size: 0,
    width: 0,
    height: 0,
  },
};

export function MediaSection() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProjectFormValues>();

  const {
    fields: mediaFields,
    append: appendMedia,
    remove: removeMedia,
  } = useFieldArray({ control, name: "media" });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 text-left">
            <div className="text-brand-primary bg-brand-black-450 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
              <FileVideoIcon size={15} />
            </div>

            <CardTitle className="text-foreground truncate text-base">
              Media
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-3">
          {mediaFields.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/15 bg-white/3 py-8 text-center">
              <ImageIcon size={"2rem"} className="text-muted-foreground" />
              <p className="text-foreground">No media added yet</p>
            </div>
          )}

          {mediaFields.length > 0 && (
            <div className="flex flex-col gap-2">
              {mediaFields.map((field, mIdx) => (
                <MediaRow
                  key={field.id}
                  mediaIndex={mIdx}
                  control={control}
                  register={register}
                  watch={watch}
                  remove={removeMedia}
                />
              ))}
            </div>
          )}

          {errors.media?.message && (
            <p className="text-xs font-medium text-red-400">
              {errors.media.message}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={() => appendMedia(EMPTY_MEDIA)}
        >
          <Plus size={12} />
          Add media
        </Button>
      </CardFooter>
    </Card>
  );
}
