import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "~/components/layouts/container";
import { DiscoverMoreProjects } from "~/components/organism/discover-more-projects";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery } from "~/lib/auth-server";
import { safeObj } from "~/lib/data.helpers";
import type { Profile } from "~/types/models";
import { MentorshipBanner } from "./_components/mentorship-badge";
import { ProfileNavigation } from "./_components/profile-navigations";
import { ProfileDetailsSection } from "./_components/profile-section";

export const revalidate = 60;

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
  params: Promise<{
    username: string;
  }>;
  children: React.ReactNode;
};

export default async function ProfileCard(props: ProfileCardProps) {
  const { params, children } = props;

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
    <Container level="max" className="mx-auto flex flex-col px-5 py-8 md:px-8">
      <ProfileCoverImage profile={profile} />

      <section className="relative z-10 flex flex-col gap-4 md:flex-row">
        <div className="basis-3/12">
          <ProfileDetailsSection profile={profile} />
          {/*<ShareButton username={username} />*/}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4">
            <MentorshipBanner profile={profile} />
            <ProfileNavigation profile={profile} />
          </div>
          <div className="mt-4 flex flex-1">{children}</div>
        </div>
      </section>

      <DiscoverMoreProjects />
    </Container>
  );
}

type ProfileCoverImageProps = { profile: Profile };

function ProfileCoverImage(props: ProfileCoverImageProps) {
  const { profile } = props;

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
