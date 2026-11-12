"use client";
import { MapPin } from "lucide-react";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import { ProjectLinkIcon } from "~/components/atoms";
import { EmptyState } from "~/components/layouts/empty-state";
import { SectionCard } from "~/components/layouts/section-card";
import { ProfileAvatar } from "~/components/profile/avatar";
import { safeArray } from "~/lib/data.helpers";
import { LocationImpl, ProfileImpl } from "~/lib/factories";
import type { Profile } from "~/types/models";

export type ProfileDetailsSectionProps = { profile: Profile };

export function ProfileDetailsSection(props: ProfileDetailsSectionProps) {
  const { profile } = props;

  const profile_links = safeArray(profile.links);

  /* @todo: integrate seniority — leaderboard score vs user-selected */
  const seniority = "Senior";

  return (
    <div className="flex flex-col items-stretch gap-y-4">
      <SectionCard className="flex flex-col items-stretch">
        <div className="mx-auto -mt-24">
          <ProfileAvatar
            name={ProfileImpl.initials(profile)}
            src={profile.profileImage ?? ""}
            verified={profile.verified}
            className="size-36"
          />
        </div>

        <div className="divide-border-subtle -mx-4 divide-y *:px-6 *:py-4">
          <div className="text-center">
            <p className="text-foreground text-2xl">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-muted-foreground text-base">
              @{profile.username}
            </p>
          </div>

          <div className="divide-subtle flex divide-x text-center *:flex-1">
            {/*<div>
            <div className="text-sm text-muted-foreground">Followers</div>
            <div className="text-2xl font-semibold">8K</div>
          </div>*/}
            <div>
              <div className="text-muted-foreground text-sm">Ranking</div>
              <div className="text-2xl font-semibold">{seniority}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Projects</div>
              <div className="text-2xl font-semibold">
                {profile.projectCount ?? 0}
              </div>
            </div>
          </div>

          {/* Short Bio */}
          {profile.shortBio && (
            <div>
              <p className="text-sm">
                <Balancer>{profile.shortBio}</Balancer>
              </p>
            </div>
          )}

          <div className="text-muted-foreground mx-auto -mb-4 flex items-center justify-start gap-1 text-sm">
            <MapPin size={"1.2em"} />
            &nbsp;
            {LocationImpl.basic(profile.location)}
          </div>
        </div>
      </SectionCard>

      <SectionCard className="flex flex-col gap-4">
        <h5 className="text-foreground text-base font-semibold">
          Social links
        </h5>
        <EmptyState isEmpty={profile_links.length === 0}>
          <EmptyState.Content>
            <p className="text-muted-foreground w-full text-start text-sm">
              No social media links
            </p>
          </EmptyState.Content>

          <EmptyState.Conceal>
            <div className="flex flex-col divide-y *:py-2">
              {profile_links.map((link) => {
                return (
                  <Link
                    key={link.tag}
                    href={link.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    <div className="flex items-start gap-4">
                      <ProjectLinkIcon
                        tag={link.tag}
                        size={22}
                        className="text-[hsl(from_var(--brand-primary)_h_s_40)]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-foreground group-hover:text-brand-primary truncate text-base transition-colors">
                          {link.value.replace(/^https?:\/\/(www\.)?/, "")}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </EmptyState.Conceal>
        </EmptyState>
      </SectionCard>

      {/* Contact Information */}
      {/*<div>
      <div className="mb-6 flex items-center gap-2">
        <div className="h-1 w-8 rounded-full bg-linear-to-r from-emerald-400 to-teal-400"></div>
        <h2 className="text-xs font-bold tracking-widest text-white/70 uppercase">
          Contact Information
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        <div className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:scale-[1.02] hover:border-white/30 hover:shadow-xl md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="rounded-2xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 p-3 shadow-lg transition-all group-hover:scale-110 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 md:p-3.5">
                <Mail size={22} className="text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
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

        <div className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:scale-[1.02] hover:border-white/30 hover:shadow-xl md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 items-start gap-4">
              <div className="rounded-2xl bg-linear-to-br from-blue-500/20 to-indigo-500/20 p-3 shadow-lg transition-all group-hover:scale-110 group-hover:from-blue-500/30 group-hover:to-indigo-500/30 md:p-3.5">
                <Phone size={22} className="text-blue-300" />
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
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
    </div>*/}
    </div>
  );
}
