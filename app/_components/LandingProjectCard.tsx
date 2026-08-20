"use client";

import { FileText, HeartIcon } from "lucide-react";
import { useRef, useState } from "react";
import { MediaThumb } from "~/app/_components/MediaThumb";
import { ProjectModal } from "~/app/_components/ProjectModal";
import { ProfileAvatar } from "~/components/profile/avatar";
import { cn } from "~/lib/utils";
import type { Project } from "~/types/models";

function VideoBadgeSvg({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label="Video"
    >
      <title>Video</title>
      <path d="M15 12l-6 4V8l6 4z" />
      <rect
        x="2"
        y="3"
        width="20"
        height="18"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

const LandingProjectCard = ({ project }: { project: Project }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const firstMedia = project.media?.[0] ?? null;
  const mimeType = firstMedia?.metadata?.mimeType ?? "";
  const isVideo = mimeType.startsWith("video/");
  const likes_count = "3.3k";

  return (
    <>
      <section
        className="group flex flex-col relative [font-size:12px] rounded-(--media-radius) bg-muted p-(--media-padding) w-full"
        style={{
          "--media-radius": "1.8em",
          "--media-padding": "0.6em",
        }}
      >
        <div className="overflow-hidden rounded-[calc(var(--media-radius)-calc(var(--media-padding)*0.5))]">
          <MediaThumbnail
            variant={isVideo ? "video" : "image"}
            media={firstMedia}
          />
        </div>

        <div className="flex items-center pt-2 px-[0.8em] justify-between z-20 relative">
          <div className="inline-flex items-center gap-[0.6em]">
            <ProfileAvatar
              className="size-[2.4em] bg-blue-400! rounded-full"
              name="John Doe"
            />
            <h3 className="font-semibold text-sm text-foreground line-clamp-1">
              {project.username ?? "--"}
            </h3>
          </div>

          <div className="inline-flex gap-0.5 text-sm items-center text-muted-foreground">
            <HeartIcon size="1em" />
            <span>{likes_count}</span>
          </div>
        </div>
      </section>

      <ProjectModal
        project={project}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

type MediaProps = {
  variant: "video" | "image";
  media: Project["media"] | null;
  alt: string | undefined;
};

function MediaThumbnail({ variant, media, alt }: MediaProps) {
  const isVideo = variant === "video";
  const videoRef = useRef<HTMLVideoElement>(null);

  const thumbnail = (
    <MediaThumb
      item={media}
      alt={alt}
      fill
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      videoRef={videoRef}
    />
  );

  if (isVideo) {
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: Not necessary
      <div
        className="video-container"
        onMouseEnter={() => {
          videoRef.current?.play().catch(() => {});
        }}
        onMouseLeave={() => {
          videoRef.current?.pause();
        }}
      >
        {thumbnail}
      </div>
    );
  }

  return thumbnail;
}

export default LandingProjectCard;
