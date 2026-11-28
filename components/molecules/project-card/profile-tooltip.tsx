"use client";

import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { type ComponentPropsWithoutRef, forwardRef, useEffect } from "react";
import { ProfileAvatar } from "~/components/profile/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/convex/_generated/api";

const OPEN_DELAY_MS = 200;
// Keeps the tooltip off the viewport edge when the card sits near one.
const COLLISION_PADDING_PX = 8;

// Survives tooltip unmount/remount cycles, so re-hovering renders the last
// copy while Convex re-syncs instead of blanking out.
const queryCache = new Map<string, unknown>();

/**
 * useQuery plus a stale-while-revalidate cache: `fresh` wins once the
 * subscription syncs; the cached copy renders while it is still loading.
 */
function useCachedQuery<T>(
  query: FunctionReference<"query">,
  args: Record<string, unknown> | "skip",
  cacheKey: string,
): T | undefined {
  const fresh = useQuery(query, args) as T | undefined;
  const cached = queryCache.get(cacheKey) as T | undefined;

  useEffect(() => {
    if (fresh !== undefined) queryCache.set(cacheKey, fresh);
  }, [cacheKey, fresh]);

  // `fresh ?? cached` would let a stale cached profile shadow a fresh null
  // (profile deleted), so only an actual load-in-progress defers to the cache.
  return fresh !== undefined ? fresh : cached;
}

/**
 * Minimal shape the tooltip renders. `profile.skills` holds skill IDs;
 * names come from `api.skills.listSkills`.
 */
type TooltipProfile = {
  profileImage: string | null;
  verified?: boolean;
  title: { name: string } | null;
  shortBio?: string | null;
  resolvedSkills?: { name: string }[];
  location?: { city: string; country: string } | null;
};

interface ProfileTooltipProps extends ComponentPropsWithoutRef<"div"> {
  /** Owner full name, shown as the tooltip heading. */
  name: string;
  /** Tooltip is only rendered when the owner has a username. */
  username: string | null;
}

/**
 * Hover tooltip for the project card owner (Figma node 1021:3780).
 *
 * Lazily evaluated: Radix mounts the content (and starts the Convex
 * subscriptions) only after the trigger has been hovered for OPEN_DELAY_MS;
 * leaving unmounts it all. Positioning is viewport-aware via Radix collision
 * detection: it flips and shifts to stay on screen near viewport edges.
 */
const ProfileTooltip = forwardRef<HTMLDivElement, ProfileTooltipProps>(
  ({ name, username, children, className, ...props }, ref) => {
    if (!username) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      );
    }

    return (
      <Tooltip delayDuration={OPEN_DELAY_MS} disableHoverableContent>
        <TooltipTrigger asChild>
          <div ref={ref} className={className} {...props}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={COLLISION_PADDING_PX}
          className="bg-muted pointer-events-none w-71.5 rounded-2xl p-4 empty:hidden"
        >
          <ProfileTooltipBody name={name} username={username} />
        </TooltipContent>
      </Tooltip>
    );
  },
);
ProfileTooltip.displayName = "ProfileTooltip";

// Figma 1032:5472 (Variant=Skeleton) — shown while the profile query loads.
// Widths are percentages of their containers (182.6px / 77.4px / 77.4px at the
// 286px tooltip width).
function ProfileTooltipSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-white/10" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="h-4 w-[88%] animate-pulse rounded-xl bg-white/10" />
          <div className="h-2.5 w-[37%] animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
      <div aria-hidden className="bg-border h-px w-full" />
      <div className="h-4 w-[30%] animate-pulse rounded-xl bg-white/10" />
    </div>
  );
}

type ProfileTooltipBodyProps = {
  name: string;
  username: string;
};

function ProfileTooltipBody(props: ProfileTooltipBodyProps) {
  const { name, username } = props;

  // Queries only subscribe while this body is mounted (i.e. while hovered).
  // ponytail: profiles.ts uses queryGeneric, so this query's inferred type is
  // any; narrow locally until profiles.ts uses the generated server `query`.
  const profile = useCachedQuery<TooltipProfile | null>(
    api.profiles.getProfileByUsername,
    { username },
    `profile:${username}`,
  );

  // undefined = still loading (skeleton); null = loaded, no such profile
  // (nothing to show — the empty bubble hides itself via empty:hidden).
  if (profile === undefined) return <ProfileTooltipSkeleton />;
  if (profile === null) return null;

  const skillNames = (profile.resolvedSkills ?? [])
    .slice(0, 3)
    .map((skill) => skill.name);

  // Figma component set 1027:5385 — both variants share the divider + footer
  // ("Based in X"); V1 (bio) adds the bio paragraph and its skill badges above.
  const hasBio = Boolean(profile.shortBio);
  const city = profile.location?.city ?? "";
  const country = profile.location?.country ?? "";
  const hasSkills = skillNames.length > 0;
  const location = city || country ? `Based in ${city || country}` : null;
  const hasFooter = Boolean(location) || hasSkills;

  const badges = hasSkills ? (
    <div className="flex items-center gap-1.5">
      {skillNames.map((skillName) => (
        <Badge key={skillName} variant="outline" className="bg-white/5 text-xs">
          {skillName}
        </Badge>
      ))}
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <ProfileAvatar
          className="size-10 shrink-0 rounded-full"
          name={name}
          src={profile.profileImage ?? undefined}
          verified={profile.verified}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-foreground text-lg leading-4.5 font-medium">
            {name}
          </p>
          {profile.title ? (
            <p className="text-brand-primary text-[0.8125rem] leading-4 font-light">
              {profile.title.name}
            </p>
          ) : null}
        </div>
      </div>

      {hasBio ? (
        <>
          <p className="text-foreground line-clamp-2 text-sm leading-4 text-balance">
            {profile.shortBio}
          </p>
          {badges}
          {location ? (
            <>
              <div aria-hidden className="bg-border h-px w-full" />
              {/* Right side intentionally empty: skill icons land here when
                  the data model grows icon URLs (badges stay above for now). */}
              <div className="flex w-full items-end justify-between gap-2">
                <p className="text-muted-foreground text-sm leading-4">
                  {location}
                </p>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {!hasBio && hasFooter ? (
        <>
          <div aria-hidden className="bg-border h-px w-full" />
          <div className="flex w-full items-center justify-between gap-2">
            {location ? (
              <p className="text-muted-foreground text-sm leading-4">
                {location}
              </p>
            ) : null}
            {badges}
          </div>
        </>
      ) : null}
    </div>
  );
}

export { ProfileTooltip };
