"use client";
import { useFeatureFlagEnabled } from "@posthog/react";
import { type FeatureFlagKeys, FeatureFlags } from "~/lib/constants";
import { isSSR } from "~/lib/utils";

export function FeatureFlag({
  flagKey,
  children,
}: {
  readonly flagKey: FeatureFlagKeys;
  readonly children: React.ReactNode;
}) {
  const isEnabled = useFeatureFlagEnabled(FeatureFlags[flagKey]);

  if (isSSR()) return null;

  if (!isEnabled) return null;

  return children;
}
