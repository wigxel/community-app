import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SectionCard } from "~/components/layouts/section-card";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery } from "~/lib/auth-server";
import { safeObj } from "~/lib/data.helpers";
import type { Profile } from "~/types/models";
import { MentorshipBanner } from "./_components/mentorship-badge";
import { ProfileDetailsSection } from "./_components/profile-section";
import Projects from "./_components/project";
import { WorkExperienceSection } from "./_components/WorkExperience";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const currentProfile = await fetchAuthQuery(
    api.profiles.getProfileByUsername,
    {
      username,
    },
  );
  const profile: Profile = safeObj(currentProfile);

  if (Object.keys(profile).length < 1) {
    return {
      title: "Profile Not Found",
      description: "User profile details",
    };
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://community-app-wigxel.vercel.app";
  const profileUrl = `${baseUrl}/${username}`;
  const ogImageUrl = `${baseUrl}/api/og-image/${username}`;

  return {
    title: `${fullName} | Profile`,
    description:
      profile.shortBio || `View ${fullName}'s profile on Wigxel Community`,
    openGraph: {
      title: `${fullName} (@${profile.username})`,
      description:
        profile.shortBio ||
        `Check out ${fullName}'s profile on Wigxel Community`,
      url: profileUrl,
      siteName: "Wigxel Community",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${fullName}'s profile picture`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${fullName} (@${profile.username})`,
      description:
        profile.shortBio ||
        `Check out ${fullName}'s profile on Wigxel Community`,
      images: [ogImageUrl],
      creator: `@${profile.username}`,
    },
    alternates: {
      canonical: profileUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export type ProfileCardProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfileCard(props: ProfileCardProps) {
  const { params } = props;

  const { username } = await params;

  const currentProfile = await fetchAuthQuery(
    api.profiles.getProfileByUsername,
    {
      username,
    },
  );

  if (currentProfile === null) {
    return notFound();
  }

  const profile: Profile = safeObj(currentProfile);

  return (
    <div className="container mx-auto px-5 py-8 md:px-8">
      {/* COVER IMAGE  */}
      <ProfileCoverImage profile={profile} />

      <section className="relative z-10 flex flex-col gap-4 md:flex-row">
        <div className="basis-3/12">
          <ProfileDetailsSection profile={profile} />
          {/*<ShareButton username={username} />*/}
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <MentorshipBanner profile={profile} />

          <SectionCard className="min-h-100 space-y-6 p-5 md:space-y-10">
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-linear-to-r from-pink-400 to-rose-400"></div>
                  <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
                    Interests
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.interests.map((interest) => (
                    <div
                      key={interest}
                      className="group rounded-2xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 px-5 py-3 transition-all hover:scale-105 hover:border-white/30 hover:shadow-lg"
                    >
                      <span className="text-base font-semibold text-white/95 transition-colors group-hover:text-pink-300">
                        {interest}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-8 w-1 rounded-full bg-linear-to-r from-pink-400 to-purple-400"></div>
                  <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
                    Skills
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skillId) => (
                    <div
                      key={skillId}
                      className="group rounded-xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 px-4 py-1 transition-all hover:border-white/30 hover:shadow-lg"
                    >
                      <span className="text-sm font-semibold text-white/95 transition-colors group-hover:text-cyan-300">
                        {skillId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects from project table (new) */}
            <Projects userId={currentProfile.userId ?? profile.userId} />

            {/* Work Experience */}
            <WorkExperienceSection userId={currentProfile.userId} />
          </SectionCard>
        </div>
      </section>
    </div>
  );
}

function ProfileCoverImage({ profile }: { profile: Profile }) {
  return (
    <div className="from-background to-muted relative mb-8 h-40 w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl lg:h-50">
      {profile.coverImage ? (
        <Image
          src={profile.coverImage}
          alt="Cover image"
          fill
          className="object-cover"
          unoptimized={profile.coverImage.startsWith("data:")}
        />
      ) : (
        <div className="from-backgorund to-muted h-full w-full bg-linear-to-r"></div>
      )}
    </div>
  );
}
