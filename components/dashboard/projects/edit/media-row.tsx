"use client";
import { Eye, Trash2, Upload } from "lucide-react";
import NextImage from "next/image";
import { useRef, useState } from "react";
import {
  type Control,
  Controller,
  type UseFormRegister,
  type UseFormWatch,
} from "react-hook-form";
import type { z } from "zod";
import type { formSchema } from "~/app/dashboard/projects/edit/page";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const ACCEPTED_TYPES: Record<string, "photo" | "video" | "pdf"> = {
  "image/jpeg": "photo",
  "image/png": "photo",
  "image/gif": "photo",
  "image/webp": "photo",
  "video/mp4": "video",
  "video/webm": "video",
  "video/ogg": "video",
  "video/quicktime": "video",
  "application/pdf": "pdf",
};

export const pendingFiles = new Map<string, File>();

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

async function extractMetadata(file: File): Promise<{
  filename: string;
  mimeType: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
}> {
  const base = { mimeType: file.type, size: file.size, filename: file.name };
  const objectUrl = URL.createObjectURL(file);

  try {
    if (file.type.startsWith("image/")) {
      const dims = await new Promise<{ width: number; height: number }>(
        (resolve) => {
          const img = new Image();
          img.onload = () =>
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({ width: 0, height: 0 });
          img.src = objectUrl;
        },
      );
      return { ...base, ...dims };
    }

    if (file.type.startsWith("video/")) {
      const info = await new Promise<{
        duration: number;
        width: number;
        height: number;
      }>((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () =>
          resolve({
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
          });
        video.onerror = () => resolve({ duration: 0, width: 0, height: 0 });
        video.src = objectUrl;
      });
      return { ...base, ...info };
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return base;
}

interface MediaPreviewModalProps {
  type: "photo" | "video" | "pdf";
  url: string;
  title?: string;
}

export function MediaPreviewModal({
  type,
  url,
  title,
}: MediaPreviewModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 text-white/30 hover:bg-blue-500/10 hover:text-blue-300"
        >
          <Eye size={13} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#252323] border-none p-0 w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle className="border-b border-white/10 p-5">
            Media Preview
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview uploaded media
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center pt-0 p-2 overflow-auto">
          {type === "photo" && (
            <NextImage
              src={url}
              alt={title ?? "Photo preview"}
              width={200}
              height={200}
              className="max-h-[75vh] w-full object-contain"
            />
          )}
          {type === "video" && (
            <video src={url} controls autoPlay className="max-h-[75vh] w-full">
              <track
                kind="captions"
                srcLang="en"
                label="English captions"
                src={url}
              />
            </video>
          )}
          {type === "pdf" && (
            <iframe
              src={url}
              className="min-h-[75vh] w-full"
              title={title ?? "Untitled Document"}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MediaRowProps {
  projectIndex: number;
  mediaIndex: number;
  control: Control<z.infer<typeof formSchema>>;
  register: UseFormRegister<z.infer<typeof formSchema>>;
  watch: UseFormWatch<z.infer<typeof formSchema>>;
  remove: (i: number) => void;
}

export default function MediaRow({
  projectIndex,
  mediaIndex,
  control,
  watch,
  remove,
}: MediaRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const meta = watch(`projects.${projectIndex}.media.${mediaIndex}.metadata`);
  const storeKey = `${projectIndex}-${mediaIndex}`;
  const previewUrl = localPreview ?? (meta?.url || null);
  const canPreview = !!previewUrl;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: {
      value: z.infer<typeof formSchema>["projects"][number]["media"][number];
      onChange: (v: unknown) => void;
    },
  ) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const detectedType = ACCEPTED_TYPES[file.type];
    if (!detectedType) {
      setError(
        "Unsupported format. Use JPEG, PNG, GIF, WebP, MP4, WebM, OGG, MOV, or PDF.",
      );
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
      name={`projects.${projectIndex}.media.${mediaIndex}`}
      render={({ field }) => (
        <>
          <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <Input
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
                maxLength={100}
                placeholder="Title (optional)"
                className="border-white/15 bg-white/5 text-sm text-white placeholder:text-white/30"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white/30 hover:bg-red-400/10 hover:text-red-400"
                onClick={() => {
                  pendingFiles.delete(storeKey);
                  if (localPreview) URL.revokeObjectURL(localPreview);
                  remove(mediaIndex);
                }}
              >
                <Trash2 size={13} />
              </Button>
            </div>

            {!hasFile ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/ogg,video/quicktime,application/pdf"
                  className="hidden"
                  onChange={(event) => handleFileChange(event, field)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/3 py-6 text-white/40 transition hover:border-blue-400/40 hover:bg-blue-500/5 hover:text-blue-300"
                >
                  <Upload size={18} />
                  <span className="text-xs font-medium">Click to upload</span>
                  <span className="text-[10px] text-white/25">
                    Images, Video, PDF · max 2 GB
                  </span>
                </button>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/20">
                <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-3 py-2">
                  {field.value?.metadata?.filename ? (
                    <span className="text-xs text-white/50">
                      {field.value?.metadata.filename}
                    </span>
                  ) : null}
                  {field.value?.metadata?.size ? (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                      {formatBytes(field.value.metadata.size)}
                    </span>
                  ) : null}
                  {field.value?.metadata?.duration ? (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                      {formatDuration(field.value.metadata.duration)}
                    </span>
                  ) : null}
                  {field.value?.metadata?.width &&
                  field.value?.metadata?.height ? (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                      {field.value.metadata.width} ×{" "}
                      {field.value.metadata.height}
                    </span>
                  ) : null}
                  {field.value?.metadata?.mimeType ? (
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
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
