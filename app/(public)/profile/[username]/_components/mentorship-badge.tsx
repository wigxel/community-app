"use client"
import { Button, Text } from "@hyperbridge/ui";
import { useFeatureFlagEnabled } from "@posthog/react";
import { GraduationCapIcon } from "lucide-react";
import { SectionCard } from "~/components/layouts/section-card";
import { ProfileImpl } from "~/lib/factories";
import type { Profile } from "~/types/models";

export function MentorshipBanner({ profile }: { profile?: Profile }) {
  const isEnabled = useFeatureFlagEnabled("mentorship-banner");

  if (profile?.userId) return null;

  // @todo: remember to re-activate
  if (isEnabled) return null;

  return <SectionCard className="flex gap-4 items-center p-4">
    <div className="size-10 bg-linear-to-bl inline-flex items-center justify-center from-orange-500 to-orange-300 rounded-full text-white">
      <GraduationCapIcon />
    </div>

    <hgroup className="flex-1">
      <Text variant="p" className="font-semibold text-foreground">Subscribe to mentorship</Text>
      <Text className="font-normal" variant="body2">
        {ProfileImpl.displayName(profile)}
        <span className="text-muted-foreground"> is offering a free mentorship program in Frontend Engineering and 3+</span>
      </Text>
    </hgroup>

    <Button variant="message" size="sm" onClick={() => alert("A subscription is done")}>
      Subscribe now
    </Button>
  </SectionCard>
}
