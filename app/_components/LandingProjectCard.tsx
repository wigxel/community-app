"use client";

import { Calendar, ExternalLink, Figma, FileText, Github } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import type { Doc } from "~/convex/_generated/dataModel";

type Project = Doc<"project">;
type MediaItem = Project["media"][number];

function getTimelineLabel(project: Project): string | null {
  const start = project.timeline?.start?.year;
  const end = project.timeline?.end?.year;

  if (!start) return null;

  if (project.ongoing) return `${start} – Present`;

  if (end && end !== start) return `${start} – ${end}`;

  return start;
}

const LINK_META: Record<
  string,
  {
    label: string;
    Icon: React.ElementType;
  }
> = {
  live: {
    label: "Live Site",
    Icon: ExternalLink,
  },

  github: {
    label: "GitHub",
    Icon: Github,
  },

  figma: {
    label: "Figma",
    Icon: Figma,
  },
};

function getLinkMeta(tag: string) {
  return (
    LINK_META[tag] ?? {
      label: tag,
      Icon: ExternalLink,
    }
  );
}

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

function MediaThumb({
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
        className={`flex items-center justify-center bg-neutral-800 ${className}`}
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
        className={`flex flex-col items-center justify-center gap-2 bg-neutral-800 ${className}`}
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
        className={className}
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
        className={className}
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
      className={className}
      loading="lazy"
    />
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function ProjectModal({
  project,
  open,
  onClose,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const timelineLabel = getTimelineLabel(project);

  const media = project.media ?? [];
  const links = project.link ?? [];

  const active = media[activeIndex] ?? null;

  const isVideo = active?.metadata?.mimeType?.startsWith("video/");

  const isPdf = active?.metadata?.mimeType === "application/pdf";

  const activeUrl = active?.metadata?.url ?? null;

  // Play video whenever the active item changes or the modal opens.
  // Use a ref callback so we catch the element even on first render.
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isVideo) return;
    // Small timeout lets the Dialog finish its enter animation so the
    // video element is reliably in the DOM before we call play().
    const id = setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 50);
    return () => clearTimeout(id);
  }, [isVideo]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 bg-neutral-900 border-neutral-800 text-white rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogTitle className="sr-only">{project.title}</DialogTitle>

        <div className="relative w-full bg-neutral-950 shrink-0 max-h-[40vh] min-h-55 overflow-hidden flex items-center justify-center">
          <MediaThumb
            item={active}
            alt={project.title}
            className="max-w-full max-h-[40vh] object-contain"
            videoRef={videoRef}
          />

          {isVideo && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white text-xs">
              <VideoBadgeSvg size={11} />
              Video
            </div>
          )}

          {isPdf && activeUrl && (
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-white text-xs transition-colors duration-150"
            >
              <FileText size={11} />
              Open PDF
            </a>
          )}
        </div>

        {media.length > 1 && (
          <div className="flex gap-2 px-6 pt-4 overflow-x-auto scrollbar-none shrink-0">
            {media.map((item, i) => (
              <button
                key={item.metadata?.storageId}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 ${i === activeIndex ? "border-white/80 opacity-100" : "border-transparent opacity-40 hover:opacity-70"}`}
              >
                <MediaThumb
                  item={item}
                  alt={`${project.title} media ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* ── Scrollable Body ── */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              {timelineLabel && (
                <div className="flex items-center gap-1.5 text-yellow-300 text-xs uppercase tracking-widest mb-1.5">
                  <Calendar size={11} />

                  {timelineLabel}
                </div>
              )}

              <h2 className="text-lg font-semibold leading-snug tracking-tight text-white">
                {project.title}
              </h2>
            </div>

            {links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {links.map((link) => {
                  const { label, Icon } = getLinkMeta(link.tag);

                  return (
                    <a
                      key={`${link.tag}-${link.value}`}
                      href={link.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/14 border border-white/10 text-xs text-white/80 hover:text-white transition-colors duration-150"
                    >
                      <Icon size={12} />

                      {label}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {project.description && (
            <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

const LandingProjectCard = ({ project }: { project: Project }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const firstMedia = project.media?.[0] ?? null;

  const mimeType = firstMedia?.metadata?.mimeType ?? "";

  const isVideo = mimeType.startsWith("video/");

  const isPdf = mimeType === "application/pdf";

  const timelineLabel = getTimelineLabel(project);

  const liveLink = project.link?.find((l) => l.tag === "live")?.value ?? null;

  return (
    <>
      <button
        type="button"
        tabIndex={0}
        aria-label={`View ${project.title}`}
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();

            setModalOpen(true);
          }
        }}
        onMouseEnter={() => videoRef.current?.play().catch(() => {})}
        onMouseLeave={() => videoRef.current?.pause()}
        className="group relative overflow-hidden rounded-xl bg-neutral-900 aspect-16/10 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <div className="absolute inset-0">
          <MediaThumb
            item={firstMedia}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            videoRef={videoRef}
          />
        </div>

        {isVideo && (
          <div className="absolute top-3 right-3 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white">
            <VideoBadgeSvg size={13} />
          </div>
        )}

        {isPdf && (
          <div className="absolute top-3 right-3 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white">
            <FileText size={13} />
          </div>
        )}

        {liveLink && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ExternalLink size={10} />
            Live
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />

        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 translate-y-1.5 group-hover:translate-y-0 transition-transform duration-300">
          {timelineLabel && (
            <span className="block text-[11px] uppercase tracking-widest text-yellow-300 mb-1">
              {timelineLabel}
            </span>
          )}

          <h3 className="font-semibold text-sm text-white line-clamp-1">
            {project.title}
          </h3>

          {project.description && (
            <p className="mt-1 text-xs text-white/50 line-clamp-2 max-h-0 opacity-0 group-hover:max-h-10 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
              {project.description}
            </p>
          )}
        </div>
      </button>

      <ProjectModal
        project={project}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default LandingProjectCard;
