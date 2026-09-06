"use client";

import { IconButton } from "@hyperbridge/ui";
import { TrashIcon, Upload } from "lucide-react";
import { useRef, useState } from "react";
import {
  type Control,
  Controller,
  type UseFormRegister,
  type UseFormWatch,
} from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ACCEPTED_PROJECT_MEDIA_TYPES } from "~/lib/factories/project";
import {
  ACCEPT_ATTR,
  ACCEPTED_SET,
  MAX_FILE_SIZE,
  MAX_VIDEO_SIZE,
  pendingFiles,
} from "./media-constants";
import { extractMetadata, formatBytes, formatDuration } from "./media-helpers";
import { MediaPreviewModal } from "./media-preview-modal";
import type { ProjectFormValues } from "./project-form";

export { MediaPreviewModal, pendingFiles };

interface MediaRowProps {
  mediaIndex: number;
  control: Control<ProjectFormValues>;
  register: UseFormRegister<ProjectFormValues>;
  watch: UseFormWatch<ProjectFormValues>;
  remove: (i: number) => void;
}

export default function MediaRow(props: MediaRowProps) {
  const { mediaIndex, control, watch, remove } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const meta = watch(`media.${mediaIndex}.metadata`);
  const storeKey = `0-${mediaIndex}`;
  const previewUrl = localPreview ?? (meta?.url || null);
  const canPreview = !!previewUrl;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: {
      value: ProjectFormValues["media"][number];
      onChange: (v: unknown) => void;
    },
  ) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const detectedType = ACCEPTED_SET.has(file.type)
      ? ACCEPTED_PROJECT_MEDIA_TYPES[
          file.type as keyof typeof ACCEPTED_PROJECT_MEDIA_TYPES
        ]
      : undefined;

    if (!detectedType) {
      setError("Unsupported format. Use JPEG, PNG, WebP, MP4, WebM, OGG, MOV.");
      return;
    }

    if (detectedType === "video" && file.size > MAX_VIDEO_SIZE) {
      setError(
        `Video too large. Maximum size is 50 MB (your video: ${formatBytes(file.size)}).`,
      );
      return;
    }

    if (detectedType !== "video" && file.size > MAX_FILE_SIZE) {
      setError(
        `File too large. Maximum size is 10 MB (your file: ${formatBytes(file.size)}).`,
      );
      return;
    }

    const extracted = await extractMetadata(file);
    pendingFiles.set(storeKey, file);

    const localUrl = URL.createObjectURL(file);
    setLocalPreview(localUrl);
    setFileName(file.name);

    field.onChange({
      type: detectedType,
      metadata: {
        ...field.value?.metadata,
        ...(field.value?.metadata?.title && {
          title: field.value.metadata.title,
        }),
        url: "",
        ...extracted,
      },
    });
  };

  const hasFile = !!localPreview || !!meta?.url;

  return (
    <Controller
      control={control}
      name={`media.${mediaIndex}`}
      render={({ field }) => (
        <>
          <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/2 p-4">
            <div className="flex items-center justify-between gap-2">
              <Input
                maxLength={100}
                placeholder="Title"
                value={field.value?.metadata?.title ?? ""}
                onChange={(e) =>
                  field.onChange({
                    ...field.value,
                    metadata: {
                      ...field.value?.metadata,
                      title: e.target.value,
                    },
                  })
                }
              />

              <IconButton
                type="button"
                variant="destructive"
                onClick={() => {
                  pendingFiles.delete(storeKey);
                  if (localPreview) URL.revokeObjectURL(localPreview);
                  remove(mediaIndex);
                }}
              >
                <TrashIcon size="1em" />
              </IconButton>
            </div>

            {!hasFile ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  className="hidden"
                  onChange={(event) => handleFileChange(event, field)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-foreground/40 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/3 py-6 transition hover:border-blue-400/40 hover:bg-blue-500/5 hover:text-blue-300"
                >
                  <Upload size={18} />
                  <span className="text-xs font-medium">Click to upload</span>
                  <span className="text-foreground/25 text-[10px]">
                    Images, Video · max 10 MB (video 50 MB)
                  </span>
                </button>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/20">
                <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-3 py-2">
                  {field.value?.metadata?.filename ? (
                    <span className="text-foreground/50 text-xs">
                      {field.value?.metadata.filename}
                    </span>
                  ) : null}
                  {field.value?.metadata?.size ? (
                    <span className="text-foreground/50 rounded-md bg-white/10 px-2 py-0.5 text-[10px]">
                      {formatBytes(field.value.metadata.size)}
                    </span>
                  ) : null}
                  {field.value?.metadata?.duration ? (
                    <span className="text-foreground/50 rounded-md bg-white/10 px-2 py-0.5 text-[10px]">
                      {formatDuration(field.value.metadata.duration)}
                    </span>
                  ) : null}
                  {field.value?.metadata?.width &&
                  field.value?.metadata?.height ? (
                    <span className="text-foreground/50 rounded-md bg-white/10 px-2 py-0.5 text-[10px]">
                      {field.value.metadata.width} ×{" "}
                      {field.value.metadata.height}
                    </span>
                  ) : null}
                  {field.value?.metadata?.mimeType ? (
                    <span className="text-foreground/50 rounded-md bg-white/10 px-2 py-0.5 text-[10px]">
                      {field.value.metadata.mimeType}
                    </span>
                  ) : null}
                </div>

                {canPreview && (
                  <MediaPreviewModal
                    type={field.value?.type ?? "photo"}
                    url={previewUrl}
                    title={fileName ?? undefined}
                  />
                )}
              </div>
            )}

            {error && (
              <p className="text-xs font-medium text-red-400">{error}</p>
            )}
          </div>
        </>
      )}
    />
  );
}
