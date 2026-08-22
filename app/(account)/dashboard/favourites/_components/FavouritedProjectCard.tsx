"use client";

import { Eye, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { FavouriteButton } from "~/app/_components/FavouriteButton";

import type { FavouritedProject } from "~/types/models";

export function FavouritedProjectCard(props: { project: FavouritedProject }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { project } = props;

  const [_modalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const firstMedia = project.media?.[0] ?? null;
  const mimeType = firstMedia?.metadata?.mimeType ?? "";
  const isVideo = mimeType.startsWith("video/");
  const isPdf = mimeType === "application/pdf";
  const url = firstMedia?.metadata?.url ?? null;

  const ownerName = project.owner
    ? `${project.owner.firstName} ${project.owner.lastName}`
    : null;

  return (
    <>
      <div className="flex flex-col gap-2.5">
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
          {/* ── Background media ── */}
          <div className="absolute inset-0">
            {!url ? (
              <div className="flex h-full w-full items-center justify-center bg-neutral-800">
                <span className="text-xs uppercase tracking-widest text-neutral-500">
                  No Preview
                </span>
              </div>
            ) : isPdf ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-800">
                <FileText size={28} className="text-neutral-400" />
                <span className="text-xs uppercase tracking-widest text-neutral-500">
                  PDF
                </span>
              </div>
            ) : isVideo ? (
              <video
                ref={videoRef}
                src={url}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                muted
                playsInline
                loop
                preload="metadata"
              />
            ) : (
              <Image
                src={url}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
          </div>

          {/* ── Hover overlay: Eye (open modal) + Heart (unfavourite) ── */}
          <div
            className={`absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/55 backdrop-blur-[2px] transition-opacity duration-250 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <button
              type="button"
              aria-label={`View ${project.title}`}
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/25 hover:border-white/50 text-white transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Eye size={20} />
            </button>

            <FavouriteButton projectId={project._id} variant="overlay" />
          </div>

          {/* ── Gradient + title ── */}
          <div className="absolute inset-0 z-10 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pointer-events-none">
            <h3 className="font-semibold text-sm text-white line-clamp-1">
              {project.title}
            </h3>
          </div>
        </section>

        {/* ── Owner attribution row (below the card, not overlapping media) ── */}
        {project.owner && (
          <Link
            href={`/profile/${project.owner.username}`}
            className="flex items-center gap-2 px-1 group/owner"
          >
            <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/10">
              {project.owner.profileImage ? (
                <Image
                  src={project.owner.profileImage}
                  alt={ownerName ?? ""}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white/60">
                  {project.owner.firstName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="truncate text-xs text-white/50 group-hover/owner:text-white/80 transition-colors">
              {ownerName} · @{project.owner.username}
            </span>
          </Link>
        )}
      </div>

      {/*<ProjectModal
        project={project}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />*/}
    </>
  );
}
