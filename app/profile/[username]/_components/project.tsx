"use client";

import { useQuery } from "convex/react";
import { ExternalLink, FileText, Video } from "lucide-react";
import Image from "next/image";

import { FavouriteButton } from "~/app/_components/FavouriteButton";
import { api } from "~/convex/_generated/api";
import { safeArray } from "~/lib/data.helpers";
import type { Project } from "~/types/models";
import { EmptyStateContent } from "./empty-state";

export default function Projects({ userId }: { userId?: string }) {
  const projects = useQuery(
    api.project.listProjectByUserId,
    userId ? { userId } : "skip",
  );

  const safeProjects: Project[] = safeArray(projects);

  if (projects === undefined) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="aspect-[1.25/1] animate-pulse rounded-[8px] bg-white/[0.05]"
          />
        ))}
      </div>
    );
  }

  if (safeProjects.length === 0) {
    return <EmptyStateContent>No projects</EmptyStateContent>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {safeProjects.map((project) => {
        const media = project.media?.[0];
        const mediaUrl = media?.metadata?.url;

        return (
          <div
            key={project._id}
            className="group min-w-0 overflow-hidden rounded-[8px] bg-[#292735] transition-transform duration-200 hover:-translate-y-[1px]"
          >
            {/* Project Preview */}
            <a
              href={project.link?.[0]?.value || mediaUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative aspect-[1.25/1] w-full overflow-hidden bg-[#18171D]">
                {media?.type === "photo" && mediaUrl ? (
                  <Image
                    src={mediaUrl}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : media?.type === "video" && mediaUrl ? (
                  <>
                    <video
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    >
                      <source src={mediaUrl} type="video/mp4" />
                    </video>

                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40">
                        <Video size={13} className="text-white" />
                      </div>
                    </div>
                  </>
                ) : media?.type === "pdf" && mediaUrl ? (
                  <>
                    <div className="flex h-full w-full items-center justify-center bg-[#20202A]">
                      <FileText size={25} className="text-white/50" />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40">
                        <ExternalLink size={13} className="text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center">
                    <span className="text-[16px] font-[500] text-white/60">
                      {project.title}
                    </span>
                  </div>
                )}
              </div>
            </a>

            {/* Project Info */}
            <div className="flex h-[27px] items-center justify-between gap-2 px-2">
              <div className="flex min-w-0 items-center gap-1.5">
                {/* Small project avatar */}
                <div className="relative h-[14px] w-[14px] shrink-0 overflow-hidden rounded-full bg-[#3A3947]">
                  {media?.type === "photo" && mediaUrl ? (
                    <Image
                      src={mediaUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#3A3947]" />
                  )}
                </div>

                <span className="truncate text-[16px] font-[500] text-white/85">
                  {project.title}
                </span>
              </div>

              {project._id && (
                <div className="shrink-0">
                  <FavouriteButton projectId={project._id} variant="inline" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
