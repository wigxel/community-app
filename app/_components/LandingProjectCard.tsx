"use client";

import { useMediaQuery } from "hooks-ts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { MediaThumb } from "~/app/_components/MediaThumb";
import { HeartIcon } from "~/components/icons";
import { ProfileAvatar } from "~/components/profile/avatar";
import type { BasicProject, Media } from "~/types/models";

const LandingProjectCard = ({ project }: { project: BasicProject }) => {
  const firstMedia = project.media?.[0] ?? null;
  const mimeType = firstMedia?.metadata?.mimeType ?? "";
  const isVideo = mimeType.startsWith("video/");
  const likes_count = "3.3k";
  const pathname = usePathname();
  const isMobile = useMediaQuery(
    "(max-width: 600px) or (orientation: portrait)",
  );

  const handleNavigation = (
    event:
      | React.KeyboardEvent<HTMLAnchorElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (isMobile) return;

    event.preventDefault();
    event.stopPropagation();

    window.location.hash = `#preview:${project._id}`;
  };

  return (
    <Link
      href={
        isMobile
          ? `/projects/${project._id}`
          : { pathname, hash: `#preview:${project._id}` }
      }
      scroll={false}
      onClick={handleNavigation}
      onKeyDown={handleNavigation}
    >
      <section className="group bg-muted relative flex w-full flex-col rounded-(--project-card-media-radius) p-(--project-card-media-padding) text-[10px]">
        <div className="overflow-hidden rounded-[calc(var(--project-card-media-radius)-calc(var(--project-card-media-padding)*0.5))]">
          <MediaThumbnail
            variant={isVideo ? "video" : "image"}
            media={firstMedia}
            alt={firstMedia?.metadata?.title ?? ""}
          />
        </div>

        <div className="relative z-20 flex items-center justify-between px-[0.8em] pt-[0.85em] pb-[0.7em]">
          <div className="inline-flex items-center gap-[0.6em]">
            <ProfileAvatar
              className="size-[2.4em] rounded-full bg-blue-400!"
              name={project.ownerName}
            />
            <h3 className="text-foreground line-clamp-1 max-w-[15ch] truncate text-sm font-semibold">
              {project.username ?? "--"}
            </h3>
          </div>

          <div className="text-muted-foreground inline-flex items-center gap-0.5 text-sm">
            <HeartIcon size="1em" />
            <span>{likes_count}</span>
          </div>
        </div>
      </section>
    </Link>
  );
};

type MediaProps = {
  variant: "video" | "image";
  media: Media | null;
  alt: string;
};

function MediaThumbnail({ variant, media, alt }: MediaProps) {
  const isVideo = variant === "video";
  const videoRef = useRef<HTMLVideoElement>(null);

  const thumbnail = (
    <MediaThumb
      item={media}
      alt={alt}
      fill
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
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
