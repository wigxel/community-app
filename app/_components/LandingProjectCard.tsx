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
      <section className="group flex flex-col relative text-[10px] rounded-(--project-card-media-radius) bg-muted p-(--project-card-media-padding) w-full">
        <div className="overflow-hidden rounded-[calc(var(--project-card-media-radius)-calc(var(--project-card-media-padding)*0.5))]">
          <MediaThumbnail
            variant={isVideo ? "video" : "image"}
            media={firstMedia}
            alt={firstMedia?.metadata?.title ?? ""}
          />
        </div>

        <div className="flex items-center pt-[0.85em] pb-[0.7em] px-[0.8em] justify-between z-20 relative">
          <div className="inline-flex items-center gap-[0.6em]">
            <ProfileAvatar
              className="size-[2.4em] bg-blue-400! rounded-full"
              name={project.ownerName}
            />
            <h3 className="font-semibold truncate max-w-[15ch] text-sm text-foreground line-clamp-1">
              {project.username ?? "--"}
            </h3>
          </div>

          <div className="inline-flex gap-0.5 text-sm items-center text-muted-foreground">
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
