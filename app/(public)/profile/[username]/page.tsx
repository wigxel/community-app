import {
  BookText,
  Briefcase,
  Globe,
  Link,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Behance, Figma, Github, LinkedIn } from "~/components/icons";
import ReturnButton from "~/components/profile/return-button";
import { ShareButton } from "~/components/profile/share-button";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery } from "~/lib/auth-server";
import { safeArray, safeObj } from "~/lib/data.helpers";
import type { Profile } from "~/types/models";
import Projects from "./_components/project";
import { WorkExperienceSection } from "./_components/WorkExperience";

// Helper function to get the appropriate icon for each link type
const getLinkIcon = (tag: string) => {
  const iconMap: Record<
    string,
    React.ComponentType<{ size?: number; className?: string }>
  > = {
    linkedin: LinkedIn,
    github: Github,
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
  const profile_links = safeArray(profile.links);

  return (
    <div className="container mx-auto px-5 py-8 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ReturnButton />
          <ShareButton username={username} />
        </div>
      </div>

      {/* COVER IMAGE  */}
      <div className="relative mb-8 h-40 w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 shadow-2xl lg:h-50">
        {profile.coverImage ? (
          <Image
            src={profile.coverImage}
            alt="Cover image"
            fill
            className="object-cover"
            unoptimized={profile.coverImage.startsWith("data:")}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700"></div>
        )}
      </div>

      <section className="relative z-10 flex flex-col gap-4 md:flex-row">
        {/* Profile Header */}
        <div className="-mt-30 flex flex-col items-start gap-y-4">
          <div className="relative ml-5 aspect-square h-30 overflow-hidden rounded-full border-4 border-white bg-slate-900 shadow-2xl md:ml-7 md:h-40">
            {profile.profileImage?.startsWith("data:") ? (
              <Image
                src={profile.profileImage}
                alt={profile.firstName}
                width={200}
                height={200}
                unoptimized
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <Image
                src={profile.profileImage || "/file.svg"}
                alt={profile.firstName}
                width={200}
                height={200}
                className="object-cover object-center"
              />
            )}
          </div>

          <div className="space-y-2">
            <p className="w-fit text-center text-2xl leading-none font-bold tracking-tight">
              {profile.firstName} {profile.lastName}
            </p>

            <p className="w-fit text-center text-base font-medium text-blue-300/90">
              @{profile.username}
            </p>

            {profile.title && (
              <div className="flex w-fit items-center gap-2 rounded-full border border-blue-400/40 bg-linear-to-r from-blue-500/20 to-blue-600/20 px-4 py-2.5 text-center text-xs font-semibold text-blue-100 shadow-lg">
                <Briefcase size={18} className="text-blue-300" />
                {profile.title.name}
              </div>
            )}

            <div className="flex w-fit items-center gap-2 rounded-full border border-purple-400/40 bg-linear-to-r from-purple-500/20 to-purple-600/20 px-4 py-2.5 text-center text-sm font-semibold text-purple-100 shadow-lg">
              <MapPin size={18} className="text-purple-300" />
              {profile.location?.city
                ? `${profile.location.city}, ${profile.location.country}`
                : "Nigeria"}
            </div>
          </div>

          {/* Short Bio */}
          {profile.shortBio && (
            <div className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:border-white/30 hover:shadow-xl md:p-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1 w-8 rounded-full bg-linear-to-r from-purple-400 to-pink-400"></div>
                <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
                  Bio
                </h2>
              </div>
              <p className="text-xl leading-relaxed font-light text-white/95">
                {profile.shortBio}
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <div className="mb-6 flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-linear-to-r from-emerald-400 to-teal-400"></div>
              <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
                Contact Information
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              {/* Email */}
              <div className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:scale-[1.02] hover:border-white/30 hover:shadow-xl md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="rounded-2xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 p-3 shadow-lg transition-all group-hover:scale-110 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 md:p-3.5">
                      <Mail size={22} className="text-emerald-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
                        Email Address
                      </div>
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-lg font-medium break-all text-white/95 transition-colors hover:text-emerald-300"
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:scale-[1.02] hover:border-white/30 hover:shadow-xl md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="rounded-2xl bg-linear-to-br from-blue-500/20 to-indigo-500/20 p-3 shadow-lg transition-all group-hover:scale-110 group-hover:from-blue-500/30 group-hover:to-indigo-500/30 md:p-3.5">
                      <Phone size={22} className="text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
                        Phone Number
                      </div>
                      <div className="space-y-2">
                        {profile.phoneNumbers.map((phone) => (
                          <p key={phone} className="w-fit">
                            <a
                              href={`tel:${phone}`}
                              className="block text-lg font-medium text-white/95 transition-colors hover:text-blue-300"
                            >
                              {phone}
                            </a>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {profile_links.length > 0 && (
            <div>
              <div className="mb-6 flex items-center gap-2">
                <div className="h-1 w-8 rounded-full bg-linear-to-r from-violet-400 to-fuchsia-400"></div>
                <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
                  Links
                </h2>
              </div>

              <div className="grid grid-cols-1">
                {profile_links.map((link) => {
                  const Icon = getLinkIcon(link.tag);

                  return (
                    <a
                      key={link.tag}
                      href={link.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:scale-[1.02] hover:border-white/30 hover:shadow-xl md:p-7"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-linear-to-br from-violet-500/20 to-fuchsia-500/20 p-3 shadow-lg transition-all group-hover:scale-110 group-hover:from-violet-500/30 group-hover:to-fuchsia-500/30">
                          <Icon size={22} className="text-violet-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 text-xs font-semibold tracking-wider text-white/60 uppercase">
                            {link.title}
                          </div>
                          <p className="truncate text-lg font-medium text-white/95 transition-colors group-hover:text-violet-300">
                            {link.value.replace(/^https?:\/\/(www\.)?/, "")}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="min-h-100 flex-1 space-y-6 rounded-3xl border border-white/10 bg-linear-to-br from-slate-50/10 to-slate-50/5 p-5 text-white shadow-2xl md:-mt-5 md:space-y-10 md:p-10">
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
        </div>
      </section>
    </div>
  );
}
