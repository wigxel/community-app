"use client";

import { useState } from "react";
import Projects from "./project";
import { WorkExperienceSection } from "./WorkExperience";

type ProfileSection = "projects" | "work";

export default function ProfileSections({ userId }: { userId?: string }) {
  const [activeSection, setActiveSection] =
    useState<ProfileSection>("projects");

  return (
    <>
      <div className="mb-4 flex items-center gap-5 border-b border-white/[0.06] px-1">
        <button
          type="button"
          onClick={() => setActiveSection("projects")}
          className={
            activeSection === "projects"
              ? "border-b-2 border-white pb-2 text-[24px] font-[500] text-white"
              : "pb-2 text-[20px] font-[500] text-white/45"
          }
        >
          Projects
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("work")}
          className={
            activeSection === "work"
              ? "border-b-2 border-white pb-2 text-[24px] font-[500] text-white"
              : "pb-2 text-[20px] font-[500] text-white/45"
          }
        >
          Work history
        </button>
      </div>

      {activeSection === "projects" ? (
        <div className="[&>div]:!grid [&>div]:!grid-cols-2 [&>div]:!gap-2 sm:[&>div]:!grid-cols-3">
          <Projects userId={userId} />
        </div>
      ) : (
        <WorkExperienceSection userId={userId} />
      )}
    </>
  );
}
