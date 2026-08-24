import type { Profile } from "~/types/models";

type MaybeProfile = Profile | null | undefined;

export const ProfileImpl = {
  displayName(profile: MaybeProfile, fallback = "--") {
    return profile ? `${profile.firstName} ${profile.lastName}` : fallback;
  },
};
