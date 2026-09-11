import type { Profile } from "~/types/models";

type MaybeProfile = Profile | null | undefined;

export const ProfileImpl = {
  displayName(profile: MaybeProfile, fallback = "--") {
    return profile ? `${profile.firstName} ${profile.lastName}` : fallback;
  },

  initials(profile: MaybeProfile, fallback = "--") {
    const firstChar = (str: string): string => str?.[0].toUpperCase?.() ?? "";

    return (
      [profile?.firstName, profile?.lastName]
        .filter((e): e is string => e !== undefined)
        .map((e) => firstChar(e)) ?? fallback
    );
  },
};
