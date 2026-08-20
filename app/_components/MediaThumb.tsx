"use client";

import { FileText } from "lucide-react";
import Image from "next/image";
import type { Doc } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";

type Project = Doc<"project">;
export type MediaItem = Project["media"][number];

/**
 * Shared media renderer — handles photo / video / pdf / empty states.
 * Used by the landing feed card, the dashboard favourites card, and the
 * shared project modal so all three stay visually consistent.
 */
export function MediaThumb({
  item,
  alt,
  className = "",
  videoRef,
  fill = false,
}: {
  item: MediaItem | null;
  alt: string;
  className?: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  fill?: boolean;
}) {
  const url = item?.metadata?.url ?? null;
  const mimeType = item?.metadata?.mimeType ?? "";
  const isVideo = mimeType.startsWith("video/");
  const isPdf = mimeType === "application/pdf";

  if (!url) {
    return (
      <div
        className={`flex items-center aspect-post w-full justify-center bg-background ${className}`}
      >
        <span className="text-xs uppercase tracking-widest text-neutral-500">
          No Preview
        </span>
      </div>
    );
  }

  if (isPdf) {
    return (
      <div
        className={`flex flex-col items-center aspect-post w-full justify-center gap-2 bg-background ${className}`}
      >
        <FileText size={28} className="text-neutral-400" />
        <span className="text-xs text-neutral-500 uppercase tracking-widest">
          PDF
        </span>
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        src={url}
        className={cn("aspect-post", className)}
        muted
        playsInline
        loop
        preload="metadata"
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        className={cn(className, "aspect-post")}
        loading="lazy"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={item?.metadata?.width ?? 800}
      height={item?.metadata?.height ?? 450}
      className={cn(className, "aspect-post")}
      loading="lazy"
    />
  );
}
