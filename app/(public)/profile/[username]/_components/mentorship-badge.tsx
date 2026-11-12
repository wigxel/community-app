"use client";
import { Button, Text } from "@hyperbridge/ui";
import { useFeatureFlagEnabled } from "@posthog/react";
import { GraduationCapIcon } from "lucide-react";
import { SectionCard } from "~/components/layouts/section-card";
import { FeatureFlags } from "~/lib/constants";
import { ProfileImpl } from "~/lib/factories";
import type { Profile } from "~/types/models";

export type MentorshipBannerProps = { profile?: Profile };

export function MentorshipBanner(props: MentorshipBannerProps) {
  const { profile } = props;

  const isEnabled = useFeatureFlagEnabled(
    FeatureFlags.ENABLE_MENTORSHIP_BANNER,
  );

  if (profile?.userId) return null;

  if (!isEnabled) return null;

  return (
    <SectionCard className="flex items-center gap-4 p-4">
      <div className="inline-flex size-10 items-center justify-center rounded-full bg-linear-to-bl from-orange-500 to-orange-300 text-white">
        <GraduationCapIcon />
      </div>

      <hgroup className="flex-1">
        <Text variant="p" className="text-foreground font-semibold">
          Subscribe to mentorship
        </Text>
        <Text className="font-normal" variant="body2">
          {ProfileImpl.displayName(profile)}
          <span className="text-muted-foreground">
            {" "}
            is offering a free mentorship program in Frontend Engineering and 3+
          </span>
        </Text>
      </hgroup>

      <Button
        variant="message"
        size="sm"
        onClick={() => alert("A subscription is done")}
      >
        Subscribe now
      </Button>
    </SectionCard>
  );
}
