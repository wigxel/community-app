"use client";
import { Calendar } from "iconsax-reactjs";
import { FileText } from "lucide-react";
import React, { useRef } from "react";
import { ProjectImpl } from "~/lib/factories/project";
import type { Project } from "~/types/models";
import { FavouriteButton } from "./FavouriteButton";
import { MediaThumb } from "./MediaThumb";

export function ProjectDetails({ project }: { project: Project }) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const timelineLabel = ProjectImpl.timeline(project);
  const links = ProjectImpl.links(project);
  const media = ProjectImpl.listMedia(project);
  const active = media[activeIndex] ?? null;

  const isVideo = active?.metadata?.mimeType?.startsWith("video/");
  const isPdf = active?.metadata?.mimeType === "application/pdf";
  const activeUrl = active?.metadata?.url ?? null;

  const videoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (!isVideo) return;

    const id = setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 50);

    return () => clearTimeout(id);
  }, [isVideo]);

  return (
    <>
      <div className="relative flex max-h-[40vh] min-h-55 w-full shrink-0 items-center justify-center overflow-hidden bg-neutral-950">
        <MediaThumb
          item={active}
          alt={project.title}
          className="max-h-[40vh] max-w-full object-contain"
          videoRef={videoRef}
        />

        {isVideo && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
            <VideoBadgeSvg size={11} />
            Video
          </div>
        )}

        {isPdf && activeUrl && (
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/20"
          >
            <FileText size={11} />
            Open PDF
          </a>
        )}
      </div>

      {media.length > 1 && (
        <div className="scrollbar-none flex shrink-0 gap-2 overflow-x-auto px-6 pt-4">
          {media.map((item, i) => (
            <button
              key={item.metadata?.storageId ?? i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-10 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                i === activeIndex
                  ? "border-white/80 opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70"
              }`}
            >
              <MediaThumb
                item={item}
                alt={`${project.title} media ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Scrollable body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {timelineLabel && (
              <div className="mb-1.5 flex items-center gap-1.5 text-xs tracking-widest text-yellow-300 uppercase">
                <Calendar size={11} />
                {timelineLabel}
              </div>
            )}
            <h2 className="text-lg leading-snug font-semibold tracking-tight text-white">
              {project.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {project._id ? (
              <FavouriteButton
                projectId={project._id}
                variant="card"
                className="border-white/20 bg-white/8 hover:bg-rose-500/20"
              />
            ) : null}

            {links.map((link) => {
              return (
                <a
                  key={`${link.tag}-${link.value}`}
                  href={link.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs text-white/80 transition-colors duration-150 hover:bg-white/14 hover:text-white"
                >
                  <link.Icon size={12} />
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>

        {project.description && (
          <p className="text-sm leading-relaxed whitespace-pre-line text-neutral-400">
            {project.description}
          </p>
        )}
      </div>
    </>
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
