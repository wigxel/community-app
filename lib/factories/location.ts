import type { ProfileLocation } from "~/types/models";

export const LocationImpl = {
  /** eg. Port-Harcourt, Nigeria  */
  basic(location: ProfileLocation | null | undefined) {
    return location?.city ? `${location.city}, ${location.country}` : "Nigeria";
  },
};
