import { BookText, Globe, Link, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Behance, Figma, GitHub, LinkedIn } from "~/components/icons";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery } from "~/lib/auth-server";
import { safeArray, safeObj } from "~/lib/data.helpers";
import type { Profile } from "~/types/models";
import ProfileSections from "./_components/ProfileSections";

// Helper function to get the appropriate icon for each link type
const getLinkIcon = (tag: string) => {
  const iconMap = {
    linkedin: LinkedIn,
    github: GitHub,
    portfolio: Globe,
    docs: BookText,
    figma: Figma,
    behance: Behance,
  };

  return iconMap[tag.toLowerCase()] || Link;
};

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

export default async function ProfileCard({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
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
  const profile_links = safeArray(profile.links);

  const projects = profile.userId
    ? await fetchAuthQuery(api.project.listProjectByUserId, {
        userId: profile.userId,
      })
    : [];

  return (
    <div className="min-h-screen bg-[#17161D] text-white">
      <div className="mx-auto w-full max-w-[1180px] px-3 py-2 sm:px-5 lg:px-6">
        {/* Cover */}
        <div className="relative mt-1 h-[120px] overflow-hidden rounded-[14px] bg-black sm:h-[155px] lg:-[139px] lg:h-[144px]">
          {profile.coverImage ? (
            <Image
              src={profile.coverImage}
              alt="Cover image"
              fill
              className="object-cover"
              unoptimized={profile.coverImage.startsWith("data:")}
            />
          ) : (
            <div className="h-full w-full bg-black" />
          )}
        </div>

        {/* Main Content */}
        <div className="relative mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* LEFT COLUMN */}
          <aside className="space-y-3">
            {/* Profile Card */}
            <div className="relative rounded-[12px] bg-[#22202E] px-5 pb-5 pt-14">
              {/* Profile Image */}
              <div className="absolute -top-[44px] left-1/2 -translate-x-1/2">
                <div className="relative h-[88px] w-[88px] overflow-hidden rounded-full border-[3px] border-[#22202E] bg-[#17161D]">
                  {profile.profileImage?.startsWith("data:") ? (
                    <Image
                      src={profile.profileImage}
                      alt={profile.firstName}
                      width={176}
                      height={176}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={profile.profileImage || "/file.svg"}
                      alt={profile.firstName}
                      width={176}
                      height={176}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="text-center">
                <h1 className="text-[24px] font-[400] leading-tight">
                  {profile.firstName} {profile.lastName}
                </h1>

                <p className="mt-1 text-[16px] font-[400] text-white/45">
                  @{profile.username}
                </p>
              </div>

              {/* Bio */}
              {profile.shortBio && (
                <p className="mx-auto mt-5 max-w-[260px] text-center text-[14px] font-[400] leading-[1.55] text-white/60">
                  {profile.shortBio}
                </p>
              )}

              {/* Stats */}
              <div className="mt-6 mb-7 flex items-center justify-center gap-12 pt-2">
                <div className="text-center">
                  <p className="text-[14px] font-[400] text-white/35">
                    Followers
                  </p>

                  <p className="mt-0.5 text-[24px] font-[700]">8k</p>
                </div>

                <div className="text-center">
                  <p className="text-[14px] font-[400] text-white/35">
                    Projects
                  </p>

                  <p className="mt-0.5 text-[24px] font-[700]">
                    {projects.length}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center justify-center gap-1.5 text-[14px] font-[400] text-white/40">
                <MapPin size={16} />

                <span className="truncate">
                  {profile.location?.city
                    ? `${profile.location.city}, ${profile.location.country}`
                    : "Nigeria"}
                </span>
              </div>
            </div>

            {/* Socials */}
            {profile_links.length > 0 && (
              <div className="rounded-[12px] bg-[#22202E] px-5 py-7">
                <h2 className="mb-4 text-[17px] font-[500] text-white">
                  Socials
                </h2>

                <div className="space-y-5">
                  {profile_links.map((link) => {
                    const Icon = getLinkIcon(link.tag);

                    return (
                      <a
                        key={link.tag}
                        href={link.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 items-center gap-3 text-[16px] font-[500] text-white/55 transition-colors hover:text-white"
                      >
                        <Icon size={16} className="shrink-0" />

                        <span className="truncate">
                          {link.value.replace(/^https?:\/\/(www\.)?/, "")}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* RIGHT COLUMN */}
          <main className="min-w-0">
            {/* Mentorship Banner */}
            <div className="mb-3 flex min-h-[44px] items-center justify-between gap-3 rounded-[10px] bg-[#22202E] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500">
                  <span className="text-[9px] font-bold text-white">✦</span>
                </div>

                <div className="min-w-0">
                  <p className="text-[14px] font-[500] text-white">
                    Subscribe to mentorship
                  </p>

                  <p className="truncate text-[12px] font-[400] text-white/40">
                    {profile.firstName} {profile.lastName} is offering a free
                    mentorship program in Frontend Engineering and 3+
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 rounded-full bg-white px-3 py-1 text-[14px] font-[600] text-[#17161D] transition-opacity hover:opacity-90"
              >
                Join now
              </button>
            </div>

            {/* Projects / Work History */}
            <div className="rounded-[12px] bg-[#22202E] p-2.5">
              <ProfileSections
                userId={currentProfile.userId ?? profile.userId}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
