import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import type { Profile } from "~/types/models";

export function useAuthProfile(): Profile | null | undefined {
  return useQuery(api.profiles.getProfile);
}
