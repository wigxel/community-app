import { differenceInMonths, differenceInYears } from "date-fns";
import { isEmpty } from "effect/String";

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
};
