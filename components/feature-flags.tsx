"use client";
import { useFeatureFlagEnabled } from "@posthog/react";
import { type FeatureFlagKeys, FeatureFlags } from "~/lib/constants";
import { isSSR } from "~/lib/utils";

export type FeatureFlagProps = {
  readonly flagKey: FeatureFlagKeys;
  readonly children: React.ReactNode;
};

export function FeatureFlag(props: FeatureFlagProps) {
  const { flagKey, children } = props;

  const isEnabled = useFeatureFlagEnabled(FeatureFlags[flagKey]);

  if (isSSR()) return null;

  if (!isEnabled) return null;

  return children;
}
