"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  useContext,
  useRef,
} from "react";
import { MediaThumb } from "~/app/_components/MediaThumb";
import { HeartIcon } from "~/components/icons";
import { ProfileAvatar } from "~/components/profile/avatar";
import { cn } from "~/lib/utils";
import type { BasicProject, Media, Project } from "~/types/models";

interface ProjectCardContextValue {
  project: Project | BasicProject;
  likesCount: string | number; // TODO: derive from project data when schema includes likes
}

const ProjectCardContext = createContext<ProjectCardContextValue | null>(null);

function useProjectCardContext() {
  const ctx = useContext(ProjectCardContext);
  if (!ctx)
    throw new Error(
      "ProjectCard compound components must be used within <ProjectCardRoot>",
    );
  return ctx;
}

interface MediaThumbnailProps {
  variant: "video" | "image";
  media: Media | null;
  alt: string;
}

function MediaThumbnail({ variant, media, alt }: MediaThumbnailProps) {
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

interface ProjectCardRootProps extends ComponentPropsWithoutRef<"div"> {
  project: Project | BasicProject;
}

const ProjectCardRoot = forwardRef<HTMLDivElement, ProjectCardRootProps>(
  ({ project, children, className, ...props }, ref) => (
    <ProjectCardContext.Provider value={{ project, likesCount: "3.3k" }}>
      <div
        ref={ref}
        className={cn(
          "group bg-muted relative flex w-full max-w-sm flex-col rounded-(--project-card-media-radius) p-(--project-card-media-padding) text-[10px]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ProjectCardContext.Provider>
  ),
);
ProjectCardRoot.displayName = "ProjectCardRoot";

const ProjectCardMedia = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const { project } = useProjectCardContext();
  const firstMedia = project.media?.[0] ?? null;
  const mimeType = firstMedia?.metadata?.mimeType ?? "";
  const isVideo = mimeType.startsWith("video/");

  return (
    <div
      ref={ref}
      className={cn(
        "aspect-post relative w-full overflow-hidden rounded-[calc(var(--project-card-media-radius)-calc(var(--project-card-media-padding)*0.5))]",
        className,
      )}
      {...props}
    >
      <MediaThumbnail
        variant={isVideo ? "video" : "image"}
        media={firstMedia}
        alt={firstMedia?.metadata?.title ?? ""}
      />
    </div>
  );
});
ProjectCardMedia.displayName = "ProjectCardMedia";

const ProjectCardContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-20 flex items-center justify-between px-[0.8em] pt-[0.85em] pb-[0.7em]",
      className,
    )}
    {...props}
  />
));
ProjectCardContent.displayName = "ProjectCardContent";

interface ProjectCardOwnerProps extends ComponentPropsWithoutRef<"div"> {
  ownerName?: string;
  username?: string | null;
}

const ProjectCardOwner = forwardRef<HTMLDivElement, ProjectCardOwnerProps>(
  ({ ownerName, username, className, ...props }, ref) => {
    const { project } = useProjectCardContext();
    const resolvedName =
      ownerName ?? ("ownerName" in project ? project.ownerName : "");
    const resolvedUsername =
      username ?? ("username" in project ? project.username : null);

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center gap-[0.6em]", className)}
        {...props}
      >
        <ProfileAvatar
          className="size-[2.4em] rounded-full"
          name={resolvedName}
        />
        <h3 className="text-foreground line-clamp-1 max-w-[15ch] truncate text-sm font-semibold">
          {resolvedUsername ?? "--"}
        </h3>
      </div>
    );
  },
);
ProjectCardOwner.displayName = "ProjectCardOwner";

const ProjectCardMetrics = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const { likesCount } = useProjectCardContext();

  return (
    <div
      ref={ref}
      className={cn(
        "text-muted-foreground inline-flex items-center gap-0.5 text-sm",
        className,
      )}
      {...props}
    >
      <HeartIcon size="1em" />
      <span>{likesCount}</span>
    </div>
  );
});
ProjectCardMetrics.displayName = "ProjectCardMetrics";

export {
  ProjectCardContent,
  ProjectCardMedia,
  ProjectCardMetrics,
  ProjectCardOwner,
  ProjectCardRoot,
};
