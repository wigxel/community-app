"use client";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import { Briefcase, Building2, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import type { WorkExperience } from "~/types/models";

interface WorkExperienceSectionProps {
  userId: Id<"users">;
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
  const workExperience = useQuery(api.workExperience.getByUserId, { userId });

  if (workExperience === undefined) {
    return (
      <div className="text-sm text-white/50">Loading work experience...</div>
    );
  }

  if (workExperience.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-white/60 mb-4">No work experience added yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="h-1 w-8 rounded-full bg-linear-to-r from-cyan-400 to-sky-400"></div>
        <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
          Work Experience
        </h2>
      </div>

      <div className="relative space-y-0">
        <div className="absolute left-6.75 top-0 bottom-0 w-px bg-linear-to-b from-cyan-400/40 via-white/10 to-transparent hidden md:block" />

        {workExperience.map((job, index) => (
          <Card job={job} key={`${job.companyName}-${index}`} />
        ))}
      </div>
    </div>
  );
}

const Card = ({ job }: { job: WorkExperience }) => {
  const [imgErr, setImgErr] = useState(false);
  const isCurrent = !job.timeline.end;

  return (
    <div className="relative group">
      <div className="absolute left-4.75 top-8 h-4 w-4 rounded-full border-2 border-cyan-400/70 bg-slate-900 hidden md:flex items-center justify-center z-10 group-hover:border-cyan-300 group-hover:scale-125 transition-all">
        {isCurrent && (
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
        )}
      </div>

      <div className="md:ml-16 mb-5 rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:border-white/30 hover:shadow-xl md:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-12 w-12 overflow-hidden rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center shadow-lg">
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

              <div className="flex gap-2 mt-3 flex-wrap">
                <div className="flex gap-1 items-center flex-wrap">
                  <Briefcase size={16} />
                  <span className="badge">{typeLabels[job.type]}</span>
                </div>
                <div className="flex gap-1 items-center flex-wrap">
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
          <p className="mt-5 text-white/80 border-t border-white/10 pt-5">
            {job.description}
          </p>
        )}
      </div>
    </div>
  );
};
