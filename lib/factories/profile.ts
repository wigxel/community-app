import { differenceInMonths, differenceInYears } from "date-fns";
import { isEmpty } from "effect/String";
import type { SeniorityLevel } from "../../types/models";

type MaybeName = { firstName?: string; lastName?: string } | null | undefined;

type ExperienceEntry = { timeline: { start: number; end?: number } };

export const ProfileImpl = {
  displayName(profile: MaybeName, fallback = "--"): string {
    return profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : fallback;
  },

  initials(profile: MaybeName, fallback = "--"): string {
    const firstChar = (str: string): string => str?.[0].toUpperCase?.() ?? "";
    const initials = [profile?.firstName, profile?.lastName]
      .filter((e): e is string => e !== undefined)
      .map((e) => firstChar(e))
      .join("");

    return !isEmpty(initials) ? initials : fallback;
  },

  joinedYearsAgo(
    profile: { _creationTime?: number } | null | undefined,
    fallback = "Joined recently",
  ): string {
    if (!profile?._creationTime) return fallback;

    const now = new Date();
    const joined = new Date(profile._creationTime);
    const years = differenceInYears(now, joined);
    const months = differenceInMonths(now, joined);

    if (years >= 1) return `Joined ${years} yr${years === 1 ? "" : "s"} ago`;
    if (months >= 1) return `Joined ${months} mo${months === 1 ? "" : "s"} ago`;
    return "Joined recently";
  },

  yearsOfExperience(
    profile: { totalYearsOfExperience?: number } | null | undefined,
  ): string | null {
    const years = profile?.totalYearsOfExperience;
    if (!years || years <= 0) return null;
    return `${years} yr${years === 1 ? "" : "s"} exp`;
  },

  computeTotalYearsOfExperience(experiences: ExperienceEntry[]): number {
    const now = new Date();
    return Math.round(
      experiences.reduce((sum, exp) => {
        const end = exp.timeline.end ? new Date(exp.timeline.end) : now;
        const start = new Date(exp.timeline.start);
        const years = differenceInYears(end, start);
        return sum + (years > 0 ? years : 0);
      }, 0),
    );
  },

  // ponytail: thresholds are a product guess (junior <2, mid <5, senior <10,
  // principal 10+); nudge the cutoffs when real data says otherwise.
  seniority(totalYearsOfExperience: number | null | undefined): SeniorityLevel {
    const years = totalYearsOfExperience ?? 0;
    if (years <= 0) return "none";
    if (years >= 10) return "principal";
    if (years >= 5) return "senior";
    if (years >= 2) return "mid-level";
    return "junior";
  },

  seniorityLabel(level: SeniorityLevel | null | undefined): string {
    if (!level || level === "none") return "--";
    return level.charAt(0).toUpperCase() + level.slice(1);
  },
};
