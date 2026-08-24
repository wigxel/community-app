"use client";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import { Briefcase, Building2, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { EmptyState } from "~/components/layouts/empty-state";
import { api } from "~/convex/_generated/api";
import { safeArray } from "~/lib/data.helpers";
import type { WorkExperience } from "~/types/models";

interface WorkExperienceSectionProps {
  userId?: string;
}

const locationLabels: Record<WorkExperience["location"], string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const typeLabels: Record<WorkExperience["type"], string> = {
  "full-time": "Full-time",
  contract: "Contract",
};

function formatTimeline(start: number, end?: number): string {
  const startStr = format(new Date(start), "MMM yyyy");
  const endStr = end ? format(new Date(end), "MMM yyyy") : "Present";
  return `${startStr} – ${endStr}`;
}

function getDuration(start: number, end?: number): string {
  const endDate = end ? new Date(end) : new Date();
  const startDate = new Date(start);
  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (months < 12) return `${months} mo${months !== 1 ? "s" : ""}`;

  const years = Math.floor(months / 12);
  const rem = months % 12;

  return rem > 0
    ? `${years} yr${years !== 1 ? "s" : ""} ${rem} mo${rem !== 1 ? "s" : ""}`
    : `${years} yr${years !== 1 ? "s" : ""}`;
}

export function WorkExperienceSection({ userId }: WorkExperienceSectionProps) {
  const workExperiences = safeArray(
    useQuery(api.workExperience.getByUserId, userId ? { userId } : "skip"),
  );

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <div className="h-8 w-1 rounded-full bg-linear-to-r from-cyan-400 to-sky-400"></div>
        <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
          Work Experience
        </h2>
      </div>

      <div className="relative space-y-0">
        <EmptyState isEmpty={workExperiences.length === 0}>
          <EmptyState.Content>
            <EmptyState.Title>No work experience</EmptyState.Title>
            <EmptyState.Description>
              Your work history will appear here
            </EmptyState.Description>
          </EmptyState.Content>
          <EmptyState.Conceal>
            <div className="absolute top-0 bottom-0 left-6.75 hidden w-px bg-linear-to-b from-cyan-400/40 via-white/10 to-transparent md:block" />
            {workExperiences.map((job) => (
              <WorkExperienceItem job={job} key={`${job._id}`} />
            ))}
          </EmptyState.Conceal>
        </EmptyState>
      </div>
    </div>
  );
}

const WorkExperienceItem = ({ job }: { job: WorkExperience }) => {
  const [imgErr, setImgErr] = useState(false);
  const isCurrent = !job.timeline.end;

  return (
    <div className="group relative">
      <div className="absolute top-8 left-4.75 z-10 hidden h-4 w-4 items-center justify-center rounded-full border-2 border-cyan-400/70 bg-slate-900 transition-all group-hover:scale-125 group-hover:border-cyan-300 md:flex">
        {isCurrent && (
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
        )}
      </div>

      <div className="mb-5 rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:border-white/30 hover:shadow-xl md:ml-16 md:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg">
              {job.logo && !imgErr ? (
                <Image
                  src={job.logo}
                  alt={job.companyName}
                  width={48}
                  height={48}
                  className="object-contain"
                  onError={() => setImgErr(true)}
                />
              ) : (
                <Building2 size={22} className="text-white/50" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{job.position}</h3>
              <p className="text-sm text-cyan-300/90">{job.companyName}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  <Briefcase size={16} />
                  <span className="badge">{typeLabels[job.type]}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <MapPin size={16} />
                  <span className="badge">{locationLabels[job.location]}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-amber-200/80">
              <Clock size={13} />
              {formatTimeline(job.timeline.start, job.timeline.end)}
            </div>
            <p className="text-xs text-white/40">
              {getDuration(job.timeline.start, job.timeline.end)}
            </p>
          </div>
        </div>

        {job.description && (
          <p className="mt-5 border-t border-white/10 pt-5 text-white/80">
            {job.description}
          </p>
        )}
      </div>
    </div>
  );
};
