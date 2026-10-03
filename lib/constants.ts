export const FeatureFlags = {
  ENABLE_MENTORSHIP: "inspace_reveer_enableMentorship",
  ENABLE_PUBLIC_WORKING_HISTORY: "inspace_reveer_enableWorkingHistory",
  ENABLE_MENTORSHIP_BANNER: "inspace_reveer_enableMentorshipBanner",
  ENABLE_QUICK_PREVIEW: "inspace_reveer_enableQuickPreview",
};

export type FeatureFlagKeys = keyof typeof FeatureFlags;
