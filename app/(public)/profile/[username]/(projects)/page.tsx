import { cache } from "react";
import { BaseEmptyState } from "~/components/layouts/empty-state";
import { SectionCard } from "~/components/layouts/section-card";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery } from "~/lib/auth-server";
import { safeObj } from "~/lib/data.helpers";
import type { Profile } from "~/types/models";
import { LOAD_MORE_PORTAL_ID } from "./_components/load-more-button";
import ProfileProjects from "./_components/project";

export const revalidate = 60;

export type ProfileCardProps = {
  params: Promise<{ username: string }>;
};

const getProfile = cache(({ username }: { username: string }) => {
  return fetchAuthQuery(api.profiles.getProfileByUsername, {
    username,
  });
});

export default async function ProfileProjectsPage(props: ProfileCardProps) {
  const { params } = props;
  const { username } = await params;
  const currentProfile = await getProfile({ username });

  if (!currentProfile) {
    return <BaseEmptyState heading={"Failed to load user profile"} />;
  }

  const profile: Profile = safeObj(currentProfile);

  return (
    <>
      <SectionCard className="min-h-100 grow space-y-6 p-5 md:space-y-10">
        <ProfileProjects userId={currentProfile.userId ?? profile.userId} />
      </SectionCard>

      <div id={LOAD_MORE_PORTAL_ID} />
    </>
  );
}
