"use client";
import { useQuery } from "convex/react";
import { Calendar, ExternalLink, FileText, Video } from "lucide-react";
import Image from "next/image";
import { FavouriteButton } from "~/app/_components/FavouriteButton";
import { EmptyState } from "~/components/layouts/empty-state";
import { api } from "~/convex/_generated/api";
import { safeArray } from "~/lib/data.helpers";
import type { Project, TimelineDate } from "~/types/models";

const formatTimeline = (project: Project) => {
  const fmt = (d: TimelineDate) =>
    !d ? null : "month" in d ? `${d.month.slice(0, 3)} ${d.year}` : d.year;

  const start = fmt(project.timeline.start);
  const end = fmt(project.timeline.end);

  if (start && end) return `${start} - ${end}`;
  if (start && project.ongoing) return `${start} - Present`;
  if (start) return start;
  if (end) return end;
  return null;
};

export default function Projects({ userId }: { userId?: string }) {
  const projects = useQuery(
    api.project.listProjectByUserId,
    userId ? { userId } : "skip",
  );
  const safeProjects: Project[] = safeArray(projects);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <div className="h-8 w-1 rounded-full bg-linear-to-r from-amber-400 to-orange-400"></div>
        <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
          Projects
        </h2>
      </div>

      {projects === undefined ? (
        <div className="animate-pulse rounded-2xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-8" />
      ) : (
        <div className="space-y-6">
          {safeProjects.length === 0 ? (
            <EmptyState isEmpty={true}>
              <EmptyState.Title>No projects</EmptyState.Title>
            </EmptyState>
          ) : null}

          {safeProjects.map((project) => {
            const project_timeline = formatTimeline(project);

            return (
              <div
                key={project._id}
                className="group space-y-5 rounded-2xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:border-white/30 hover:shadow-2xl md:p-8"
              >
                {/* Project Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    {project.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Project timeline */}
                    {project_timeline && (
                      <div className="flex items-center gap-2.5 rounded-full border border-amber-400/30 bg-linear-to-r from-amber-500/15 to-orange-500/15 px-4 py-2 text-sm font-medium text-amber-200/90 shadow-lg">
                        <Calendar size={16} className="text-amber-300" />
                        <span>{project_timeline}</span>
                      </div>
                    )}

                    {/* Favourite button */}
                    {project._id && (
                      <FavouriteButton
                        projectId={project._id}
                        variant="inline"
                      />
                    )}
                  </div>
                </div>

                {/* Project Description */}
                {project.description && (
                  <p className="text-lg leading-relaxed font-light text-white/90">
                    {project.description}
                  </p>
                )}

                {/* Project Media with Preview */}
                {project.media.length > 0 && (
                  <div>
                    <h4 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-white/60 uppercase">
                      <div className="h-0.5 w-6 rounded-full bg-white/40"></div>
                      Media Gallery
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {project.media.map((item, idx) => {
                        const key = `${project._id}-media-${idx}`;
                        return (
                          <a
                            key={key}
                            href={item.metadata?.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/media relative overflow-hidden rounded-2xl border border-white/15 bg-linear-to-br from-white/10 to-white/5 transition-all hover:border-white/30 hover:shadow-lg"
                          >
                            {/* Media Preview */}
                            <div className="relative aspect-video w-full overflow-hidden bg-linear-to-br from-slate-700/50 to-slate-800/50">
                              {item.type === "photo" && item.metadata?.url ? (
                                <Image
                                  src={item.metadata.url}
                                  alt={`${project.title} photo`}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover/media:scale-110"
                                />
                              ) : item.type === "video" &&
                                item.metadata?.url ? (
                                <div className="relative h-full w-full">
                                  <video
                                    className="h-full w-full object-cover"
                                    muted
                                  >
                                    <source
                                      src={item.metadata.url}
                                      type="video/mp4"
                                    />
                                  </video>
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <div className="rounded-full bg-white/20 p-4 transition-all group-hover/media:scale-110 group-hover/media:bg-white/30">
                                      <Video size={32} className="text-white" />
                                    </div>
                                  </div>
                                </div>
                              ) : item.type === "pdf" ? (
                                <div className="relative h-full w-full">
                                  <div className="relative h-full w-full overflow-hidden">
                                    <div className="absolute inset-0 z-1" />
                                    <embed
                                      src={`${item.metadata?.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                      type="application/pdf"
                                      className="h-full w-[calc(100%+20px)] scale-110 border-none"
                                    />
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <div className="rounded-2xl bg-linear-to-br from-red-500/20 to-orange-500/20 p-4 transition-all group-hover/media:scale-110 group-hover/media:from-red-500/30 group-hover/media:to-orange-500/30">
                                      <FileText
                                        size={32}
                                        className="text-white"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : null}

                              {/* Type Badge */}
                              <div className="absolute top-3 right-3 rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white uppercase">
                                {item.type}
                              </div>
                            </div>

                            {/* Media Info */}
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-white/95 capitalize">
                                  {item.metadata?.title ??
                                    `Untitled ${item.type === "pdf" ? "Document" : item.type}`}
                                </p>
                                {item.metadata?.url && (
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-blue-300/80 transition-colors group-hover/media:text-blue-300">
                                    <span>View</span>
                                    <ExternalLink size={12} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Project Links */}
                {project.link && project.link.length > 0 && (
                  <div>
                    <h4 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-white/60 uppercase">
                      <div className="h-0.5 w-6 rounded-full bg-white/40"></div>
                      Project Links
                    </h4>

                    <div className="flex flex-wrap gap-3">
                      {project.link.map(({ value: url }, idx) => {
                        const key = `${project._id}-link-${idx}`;

                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link flex items-center gap-2.5 rounded-xl border border-white/20 bg-linear-to-r from-white/15 to-white/10 px-5 py-2.5 text-sm font-semibold text-white/90 transition-all hover:border-white/40 hover:from-white/20 hover:to-white/15 hover:shadow-lg"
                          >
                            <ExternalLink
                              size={14}
                              className="text-white/60 transition-colors group-hover/link:text-white"
                            />
                            <span className="max-w-50 truncate">
                              {url.replace(/^https?:\/\/(www\.)?/, "")}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
