"use client";

import { Eye, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { FavouriteButton } from "~/app/_components/FavouriteButton";
import { MediaThumb } from "~/app/_components/MediaThumb";
import { ProjectModal } from "~/app/_components/ProjectModal";
import type { Doc } from "~/convex/_generated/dataModel";

type Project = Doc<"project">;

function getTimelineLabel(project: Project): string | null {
  const start = project.timeline?.start?.year;
  const end = project.timeline?.end?.year;

  if (!start) return null;
  if (project.ongoing) return `${start} – Present`;
  if (end && end !== start) return `${start} – ${end}`;
  return start;
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

const LandingProjectCard = ({ project }: { project: Project }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const firstMedia = project.media?.[0] ?? null;
  const mimeType = firstMedia?.metadata?.mimeType ?? "";
  const isVideo = mimeType.startsWith("video/");
  const isPdf = mimeType === "application/pdf";
  const timelineLabel = getTimelineLabel(project);

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Container needs hover state for video playback */}
      <section
        className="group relative overflow-hidden rounded-xl bg-neutral-900 aspect-video w-full"
        onMouseEnter={() => {
          setIsHovered(true);
          videoRef.current?.play().catch(() => {});
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          videoRef.current?.pause();
        }}
      >
        <div className="absolute inset-0">
          <MediaThumb
            item={firstMedia}
            alt={project.title}
            fill
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            videoRef={videoRef}
          />
        </div>

        {/* ── Static type badge — only shown when NOT hovered ── */}
        {(isVideo || isPdf) && (
          <div
            className={`absolute top-3 right-3 z-10 flex items-center justify-center w-7 h-7 rounded-full
                        bg-white/10 backdrop-blur-sm border border-white/15 text-white
                        transition-opacity duration-200
                        ${isHovered ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            {isVideo ? <VideoBadgeSvg size={13} /> : <FileText size={13} />}
          </div>
        )}

        {/* ── Hover overlay ── */}
        <div
          className={`absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/55 backdrop-blur-[2px] transition-opacity duration-250 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <button
            type="button"
            aria-label={`View ${project.title}`}
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center w-11 h-11 rounded-full  bg-white/15 hover:bg-white/25  backdrop-blur-sm border border-white/25 hover:border-white/50  text-white  transition-all duration-200 hover:scale-110 active:scale-95  cursor-pointer"
          >
            <Eye size={20} />
          </button>

          <FavouriteButton projectId={project._id} variant="overlay" />
        </div>

        <div className="absolute inset-0 z-10 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div
          className="absolute bottom-0 left-0 right-0 z-10 p-4
                     translate-y-1 group-hover:translate-y-0
                     transition-transform duration-300 pointer-events-none"
        >
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
      </section>

      <ProjectModal
        project={project}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default LandingProjectCard;
