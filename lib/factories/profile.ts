import { isEmpty } from "effect/String";
import type { Profile } from "~/types/models";

type MaybeProfile = Profile | null | undefined;

export const ProfileImpl = {
  displayName(profile: MaybeProfile, fallback = "--"): string {
    return profile ? `${profile.firstName} ${profile.lastName}` : fallback;
  },

  initials(profile: MaybeProfile, fallback = "--"): string {
    const firstChar = (str: string): string => str?.[0].toUpperCase?.() ?? "";
    const initials = [profile?.firstName, profile?.lastName]
      .filter((e): e is string => e !== undefined)
      .map((e) => firstChar(e))
      .join("");

    return !isEmpty(initials) ? initials : fallback;
  },
};
