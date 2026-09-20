import { Briefcase, MapPinIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { RoleFilter } from "~/components/catalog/role-filter";
import { QueryBasedSearchInput } from "~/components/molecules/search-input";
import { ProfileAvatar } from "~/components/profile/avatar";
import { Badge } from "~/components/ui/badge";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery } from "~/lib/auth-server";
import { safeArray } from "~/lib/data.helpers";
import { ProfileImpl } from "~/lib/factories/profile";
import { cn } from "~/lib/utils";
import type { Profile } from "~/types/models";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = {
  title: "Talents",
  description: "Find the right talent for your project",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function getTitles() {
  const titles = await fetchAuthQuery(api.titles.listTitles, {});
  const safeTitles = safeArray(titles);

  const getTitleId = (role: string) => {
    if (role) {
      const title = safeTitles.find(
        (title) => title.name.toLowerCase() === role.toLowerCase(),
      );

      return title?._id;
    }

    return;
  };

  return {
    titles: safeTitles,
    getTitleId,
  };
}

export default async function Catalog({ searchParams }: PageProps) {
  const { q, role } = searchParamsCache.parse(await searchParams);
  const { getTitleId } = await getTitles();

  const titleId = getTitleId(role);

  const profiles = await fetchAuthQuery(api.profiles.listProfile, {
    searchTerm: q || undefined,
    titleId: titleId || undefined,
  });
  const safeProfiles = safeArray(profiles);

  return (
    <div className="px-5 py-8 md:px-8">
      <div className="container mx-auto">
        <hgroup className="mb-12 flex flex-col">
          <h1 className="text-foreground w-fit text-[clamp(14px,7vw,36px)] font-bold">
            Top talents
          </h1>
          <p className="text-muted-foreground w-fit">Browse our top talents</p>
        </hgroup>

        <div className="mb-10 flex flex-col gap-4 lg:flex-row">
          <QueryBasedSearchInput
            className="w-full"
            config={{ key: "query" }}
            placeholder={"What you looking for?"}
          />

          {/*<RoleFiltersDropdown />*/}
        </div>

        {/* Profile List or Empty State */}
        {safeProfiles.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-20">
            <p className="mb-4 text-2xl font-semibold">No profiles found.</p>
            <p className="text-lg">
              {q
                ? `No results found for "${q}"`
                : "It looks like there are no professionals in our catalog yet."}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {safeProfiles.map((profile, idx) => {
              const key = `profile-card-${idx}`;

              return (
                <Link key={key} href={`/profile/${profile.username}`}>
                  <TalentListCard profile={profile} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

async function RoleFiltersDropdown() {
  const titles = await fetchAuthQuery(api.titles.listTitles, {});

  return <RoleFilter titles={titles} />;
}

const levelBadge = (level: string) => {
  switch (level) {
    case "junior":
      return "border-blue-600 text-blue-600";
    case "mid-level":
      return "border-green-600 text-green-600";
    case "senior":
      return "border-purple-400 text-purple-400";
    default:
      return "border-gray-600 text-gray-600";
  }
};

function TalentListCard({ profile }: { profile: Profile }) {
  const title = profile.title;
  const joined = "Joined 3+ years";
  const locationName = "Port harcourt, Nigeria";
  const experience = "4+ years of experience";
  const seniority = "senior";

  return (
    <div className="group bg-muted border-foreground/5 corner-sharp flex aspect-3/2 flex-col justify-between gap-8 rounded-2xl border px-6 py-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-6">
            <ProfileAvatar
              name={ProfileImpl.initials(profile)}
              src={profile.profileImage ?? undefined}
              verified={true}
            />
          </div>

          {seniority === "none" ? null : (
            <Badge
              variant={"outline"}
              className={cn("font-medium", levelBadge("senior"))}
            >
              {seniority}
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          <div className="text-xl">{ProfileImpl.displayName(profile)}</div>
          <div className="text-brand-primary inline-flex items-center gap-2 text-sm">
            <span>{title?.name ?? "Hacker"}</span>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground -mb-3 flex items-end justify-between text-sm">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 opacity-50" />
            {experience}
          </div>

          <div className="flex items-center gap-2">
            <MapPinIcon className="size-4 opacity-50" />
            {locationName}
          </div>
        </div>

        <div className="text-muted-foreground text-xs">{joined}</div>
      </div>
    </div>
  );
}
