import { fetchQuery } from "convex/nextjs";
import { format } from "date-fns";
import {
  Briefcase,
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Link,
  Mail,
  Phone,
  Video,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { GitHub, LinkedIn } from "~/components/icons";
import ReturnButton from "~/components/profile/return-button";
import { api } from "~/convex/_generated/api";
import { safeArray, safeObj } from "~/lib/data.helpers";
import type { Profile } from "~/types/models";

// Create a cached version of the profile query
const getProfileByUsername = cache(async (username: string) => {
  return await fetchQuery(api.profiles.getProfileByUsername, { username });
});

// Helper function to get the appropriate icon for each link type
const getLinkIcon = (tag: string) => {
  const iconMap = {
    linkedin: LinkedIn,
    github: GitHub,
    portfolio: Globe,
  };
  return iconMap[tag.toLowerCase()] || Link;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const currentProfile = await getProfileByUsername(username);
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
  const currentProfile = await getProfileByUsername(username);
  const profile: Profile = safeObj(currentProfile);

  if (Object.keys(profile).length < 1) {
    notFound();
  }

  const profile_links = safeArray(profile.links);

  return (
    <div className="container mx-auto px-5 py-8 md:px-8">
      <div className="mb-5 flex justify-between items-center gap-5">
        <h1 className="text-white-700 w-fit text-[clamp(14px,7vw,36px)] font-bold">
          User Profile
        </h1>
        <ReturnButton />
      </div>
      <div className="min-h-100 space-y-6 rounded-3xl bg-linear-to-br from-slate-50/10 to-slate-50/5 p-5 text-white shadow-2xl md:space-y-10 md:p-10 border border-white/10">
        {/* Profile Header */}
        <div className="flex flex-col items-start gap-x-10 gap-y-5 md:flex-row md:items-center">
          <div className="relative aspect-square h-35 overflow-hidden rounded-full border-2 border-white/30 shadow-2xl md:h-50 ring-4 ring-white/10">
            <Image
              src={profile.profileImage || "/file.svg"}
              alt={profile.firstName}
              width={200}
              height={200}
              className="object-cover object-center"
            />
          </div>
          <div className="space-y-3">
            <p className="w-fit text-center text-2xl leading-none font-bold tracking-tight">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="w-fit text-center text-base font-medium text-blue-300/90">
              @{profile.username}
            </p>
            <div className="flex w-fit items-center gap-2 rounded-full border border-blue-400/40 bg-linear-to-r from-blue-500/20 to-blue-600/20 px-4 py-2.5 text-center text-sm font-semibold text-blue-100 shadow-lg">
              <Briefcase size={18} className="text-blue-300" />
              {profile.title.name}
            </div>
          </div>
        </div>

        {/* Short Bio */}
        {profile.shortBio && (
          <div className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:border-white/30 hover:shadow-xl md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-8 rounded-full bg-linear-to-r from-purple-400 to-pink-400"></div>
              <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
                Bio
              </h2>
            </div>
            <p className="text-xl leading-relaxed text-white/95 font-light">
              {profile.shortBio}
            </p>
          </div>
        )}

        {/* Contact Information */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-8 rounded-full bg-linear-to-r from-emerald-400 to-teal-400"></div>
            <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
              Contact Information
            </h2>
          </div>
          <div className="flex flex-col gap-5 *:w-full lg:flex-row">
            {/* Email */}
            <div className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:border-white/30 hover:shadow-xl hover:scale-[1.02] md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="rounded-2xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 p-3 transition-all group-hover:from-emerald-500/30 group-hover:to-teal-500/30 group-hover:scale-110 md:p-3.5 shadow-lg">
                    <Mail size={22} className="text-emerald-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 text-xs tracking-wider text-white/60 uppercase font-semibold">
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
            <div className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:border-white/30 hover:shadow-xl hover:scale-[1.02] md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 items-start gap-4">
                  <div className="rounded-2xl bg-linear-to-br from-blue-500/20 to-indigo-500/20 p-3 transition-all group-hover:from-blue-500/30 group-hover:to-indigo-500/30 group-hover:scale-110 md:p-3.5 shadow-lg">
                    <Phone size={22} className="text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-xs tracking-wider text-white/60 uppercase font-semibold">
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
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-8 rounded-full bg-linear-to-r from-violet-400 to-fuchsia-400"></div>
              <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
                Links
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {profile_links.map((link) => {
                const Icon = getLinkIcon(link.tag);
                return (
                  <a
                    key={link.tag}
                    href={link.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:border-white/30 hover:shadow-xl hover:scale-[1.02] md:p-7"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-linear-to-br from-violet-500/20 to-fuchsia-500/20 p-3 transition-all group-hover:from-violet-500/30 group-hover:to-fuchsia-500/30 group-hover:scale-110 shadow-lg">
                        <Icon size={22} className="text-violet-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 text-xs tracking-wider text-white/60 uppercase font-semibold">
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

        {/* Projects */}
        {profile.projects && profile.projects.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-8 rounded-full bg-linear-to-r from-amber-400 to-orange-400"></div>
              <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
                Projects
              </h2>
            </div>
            <div className="space-y-6">
              {profile.projects.map((project, index) => {
                const key = `${project.title}-${index}`;
                return (
                  <div
                    key={key}
                    className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:border-white/30 hover:shadow-2xl md:p-8"
                  >
                    {/* Project Header */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2.5 rounded-full border border-amber-400/30 bg-linear-to-r from-amber-500/15 to-orange-500/15 px-4 py-2 text-sm font-medium text-amber-200/90 shadow-lg">
                        <Calendar size={16} className="text-amber-300" />
                        <span>
                          {format(new Date(project.timeline.start), "MMM yyyy")}
                          {" - "}
                          {format(new Date(project.timeline.end), "MMM yyyy")}
                        </span>
                      </div>
                    </div>

                    {/* Project Description */}
                    <p className="mb-7 text-lg leading-relaxed text-white/90 font-light">
                      {project.description}
                    </p>

                    {/* Project Media with Preview */}
                    {project.media.length > 0 && (
                      <div className="mb-7">
                        <h4 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-white/60 uppercase">
                          <div className="h-0.5 w-6 rounded-full bg-white/40"></div>
                          Media Gallery
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {project.media.map((item, idx) => {
                            const key = `${project.title}-media-${idx}`;
                            return (
                              <a
                                key={key}
                                href={(item.metadata?.url as string) || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/media relative overflow-hidden rounded-2xl border border-white/15 bg-linear-to-br from-white/10 to-white/5 transition-all hover:border-white/30 hover:shadow-xl hover:scale-105"
                              >
                                {/* Media Preview */}
                                <div className="relative aspect-video w-full overflow-hidden bg-linear-to-br from-slate-700/50 to-slate-800/50">
                                  {item.type === "photo" &&
                                  item.metadata?.url ? (
                                    <Image
                                      src={item.metadata.url as string}
                                      alt={`${project.title} photo`}
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover/media:scale-110"
                                    />
                                  ) : item.type === "video" &&
                                    item.metadata?.url ? (
                                    <div className="relative h-full w-full">
                                      <video
                                        className="h-full w-full object-cover"
                                        muted
                                        poster={
                                          (item.metadata
                                            ?.thumbnail as string) || undefined
                                        }
                                      >
                                        <source
                                          src={item.metadata.url as string}
                                          type="video/mp4"
                                        />
                                      </video>
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <div className="rounded-full bg-white/20 p-4 transition-all group-hover/media:bg-white/30 group-hover/media:scale-110">
                                          <Video
                                            size={32}
                                            className="text-white"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : item.type === "pdf" ? (
                                    <div className="relative h-full w-full">
                                      <div className="relative w-full h-full overflow-hidden">
                                        <div className="absolute z-1 inset-0" />
                                        <embed
                                          src={`${item.metadata?.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                          type="application/pdf"
                                          className="w-[calc(100%+20px)] h-full border-none scale-110"
                                        />
                                      </div>
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <div className="rounded-2xl bg-linear-to-br from-red-500/20 to-orange-500/20 p-8 transition-all group-hover/media:from-red-500/30 group-hover/media:to-orange-500/30 group-hover/media:scale-110">
                                          <FileText
                                            size={32}
                                            className="text-white"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <ImageIcon
                                        size={48}
                                        className="text-white/40"
                                      />
                                    </div>
                                  )}

                                  {/* Type Badge */}
                                  <div className="absolute top-3 right-3 rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold uppercase text-white">
                                    {item.type}
                                  </div>
                                </div>

                                {/* Media Info */}
                                <div className="p-4">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold capitalize text-white/95">
                                      {(item.metadata?.title as string) ??
                                        `Untitled ${item.type === "pdf" ? "Document" : item.type}`}
                                    </p>
                                    {(item.metadata?.url as string) && (
                                      <div className="flex items-center gap-1.5 text-xs text-blue-300/80 group-hover/media:text-blue-300 transition-colors font-medium">
                                        <span>View</span>
                                        <ExternalLink size={12} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Project Links */}
                    {project.link && project.link.length > 0 && (
                      <div>
                        <h4 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-white/60 uppercase">
                          <div className="h-0.5 w-6 rounded-full bg-white/40"></div>
                          Project Links
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {project.link.map((url, idx) => {
                            const key = `${index}-${idx}`;
                            return (
                              <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/link flex items-center gap-2.5 rounded-xl border border-white/20 bg-linear-to-r from-white/15 to-white/10 px-5 py-2.5 text-sm font-semibold text-white/90 transition-all hover:border-white/40 hover:from-white/20 hover:to-white/15 hover:shadow-lg hover:scale-105"
                              >
                                <ExternalLink
                                  size={14}
                                  className="text-white/60 transition-colors group-hover/link:text-white"
                                />
                                <span className="truncate max-w-50">
                                  {url.replace(/^https?:\/\/(www\.)?/, "")}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
