import { describe, it, expect, vi, beforeEach } from "vitest";
import { subYears, subMonths, subDays } from "date-fns";
import { ProfileImpl } from "~/lib/factories/profile";

type ExperienceInput = { timeline: { start: number; end?: number } };

describe("ProfileImpl", () => {
  describe("displayName", () => {
    it("returns full name for valid profile", () => {
      const profile = { firstName: "John", lastName: "Doe" };
      expect(ProfileImpl.displayName(profile)).toBe("John Doe");
    });

    it("returns fallback for null profile", () => {
      expect(ProfileImpl.displayName(null)).toBe("--");
    });

    it("returns custom fallback when provided", () => {
      expect(ProfileImpl.displayName(null, "N/A")).toBe("N/A");
    });
  });

  describe("initials", () => {
    it("returns first letter of first and last name", () => {
      const profile = { firstName: "John", lastName: "Doe" };
      expect(ProfileImpl.initials(profile)).toBe("JD");
    });

    it("returns fallback for null profile", () => {
      expect(ProfileImpl.initials(null)).toBe("--");
    });

    it("returns custom fallback when provided", () => {
      expect(ProfileImpl.initials(null, "??")).toBe("??");
    });
  });

  describe("joinedYearsAgo", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-09-20"));
    });

    it("returns joined X yrs ago for profile created years ago", () => {
      const profile = { _creationTime: subYears(new Date(), 3).getTime() };
      expect(ProfileImpl.joinedYearsAgo(profile)).toBe("Joined 3 yrs ago");
    });

    it("returns singular for 1 year", () => {
      const profile = { _creationTime: subYears(new Date(), 1).getTime() };
      expect(ProfileImpl.joinedYearsAgo(profile)).toBe("Joined 1 yr ago");
    });

    it("returns joined X mo ago for profile created months ago", () => {
      const profile = { _creationTime: subMonths(new Date(), 6).getTime() };
      expect(ProfileImpl.joinedYearsAgo(profile)).toBe("Joined 6 mos ago");
    });

    it("returns singular month for 1 month", () => {
      const profile = { _creationTime: subMonths(new Date(), 1).getTime() };
      expect(ProfileImpl.joinedYearsAgo(profile)).toBe("Joined 1 mo ago");
    });

    it("returns joined recently for profile created less than 1 month ago", () => {
      const profile = { _creationTime: subDays(new Date(), 14).getTime() };
      expect(ProfileImpl.joinedYearsAgo(profile)).toBe("Joined recently");
    });

    it("returns fallback for profile without _creationTime", () => {
      const profile = {};
      expect(ProfileImpl.joinedYearsAgo(profile)).toBe("Joined recently");
    });

    it("returns custom fallback when provided", () => {
      const profile = {};
      expect(ProfileImpl.joinedYearsAgo(profile, "New member")).toBe(
        "New member",
      );
    });
  });

  describe("yearsOfExperience", () => {
    it("returns X yrs exp for positive years", () => {
      expect(ProfileImpl.yearsOfExperience({ totalYearsOfExperience: 5 })).toBe(
        "5 yrs exp",
      );
    });

    it("returns singular for 1 year", () => {
      expect(ProfileImpl.yearsOfExperience({ totalYearsOfExperience: 1 })).toBe(
        "1 yr exp",
      );
    });

    it("returns null for 0 years", () => {
      expect(
        ProfileImpl.yearsOfExperience({ totalYearsOfExperience: 0 }),
      ).toBeNull();
    });

    it("returns null for undefined years", () => {
      expect(ProfileImpl.yearsOfExperience({})).toBeNull();
    });

    it("returns null for null years", () => {
      expect(
        ProfileImpl.yearsOfExperience({ totalYearsOfExperience: undefined }),
      ).toBeNull();
    });
  });

  describe("computeTotalYearsOfExperience", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-09-20"));
    });

    it("returns 0 for empty array", () => {
      expect(ProfileImpl.computeTotalYearsOfExperience([])).toBe(0);
    });

    it("computes years for a single ongoing experience", () => {
      const experiences: ExperienceInput[] = [
        { timeline: { start: subYears(new Date(), 3).getTime() } },
      ];
      expect(ProfileImpl.computeTotalYearsOfExperience(experiences)).toBe(3);
    });

    it("computes years for a single completed experience", () => {
      const experiences: ExperienceInput[] = [
        {
          timeline: {
            start: subYears(new Date(), 5).getTime(),
            end: subYears(new Date(), 2).getTime(),
          },
        },
      ];
      expect(ProfileImpl.computeTotalYearsOfExperience(experiences)).toBe(3);
    });

    it("sums multiple experiences", () => {
      const experiences: ExperienceInput[] = [
        { timeline: { start: subYears(new Date(), 5).getTime() } },
        {
          timeline: {
            start: subYears(new Date(), 3).getTime(),
            end: subYears(new Date(), 2).getTime(),
          },
        },
      ];
      expect(ProfileImpl.computeTotalYearsOfExperience(experiences)).toBe(6);
    });

    it("rounds to nearest integer", () => {
      const experiences: ExperienceInput[] = [
        { timeline: { start: subDays(new Date(), 400).getTime() } },
      ];
      expect(ProfileImpl.computeTotalYearsOfExperience(experiences)).toBe(1);
    });

    it("ignores entries with end before start", () => {
      const experiences: ExperienceInput[] = [
        {
          timeline: {
            start: subYears(new Date(), 2).getTime(),
            end: subYears(new Date(), 3).getTime(),
          },
        },
      ];
      expect(ProfileImpl.computeTotalYearsOfExperience(experiences)).toBe(0);
    });
  });
});
