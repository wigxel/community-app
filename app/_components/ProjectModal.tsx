"use client";

import { Calendar, ExternalLink, Figma, FileText, Github } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FavouriteButton } from "~/app/_components/FavouriteButton";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import type { Doc } from "~/convex/_generated/dataModel";
import { MediaThumb } from "./MediaThumb";

type Project = Doc<"project">;

function getTimelineLabel(project: Project): string | null {
  const start = project.timeline?.start?.year;
  const end = project.timeline?.end?.year;

  if (!start) return null;
  if (project.ongoing) return `${start} – Present`;
  if (end && end !== start) return `${start} – ${end}`;
  return start;
}

const LINK_META: Record<string, { label: string; Icon: React.ElementType }> = {
  live: { label: "Live Site", Icon: ExternalLink },
  github: { label: "GitHub", Icon: Github },
  figma: { label: "Figma", Icon: Figma },
};

function getLinkMeta(tag: string) {
  return LINK_META[tag] ?? { label: tag, Icon: ExternalLink };
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

/**
 * Shared project detail modal — used by both the landing-page community
 * feed card and the dashboard Favourites page card.
 */
export function ProjectModal({
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

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isVideo) return;
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
                key={item.metadata?.storageId ?? i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  i === activeIndex
                    ? "border-white/80 opacity-100"
                    : "border-transparent opacity-40 hover:opacity-70"
                }`}
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

        {/* Scrollable body */}
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

            <div className="flex flex-wrap items-center gap-2">
              <FavouriteButton
                projectId={project._id}
                variant="card"
                className="border-white/20 bg-white/8 hover:bg-rose-500/20"
              />

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
