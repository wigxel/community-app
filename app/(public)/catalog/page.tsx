import { Briefcase } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RoleFilter } from "~/components/catalog/role-filter";
import { SearchInput } from "~/components/catalog/search-input";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery } from "~/lib/auth-server";
import { safeArray } from "~/lib/data.helpers";
import { searchParamsCache } from "./search-params";

export const metadata: Metadata = {
  title: "Profile Catalog",
  description: "Browse the profile catalog",
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
  const { titles, getTitleId } = await getTitles();

  const titleId = getTitleId(role);

  const profiles = await fetchAuthQuery(api.profiles.listProfile, {
    searchTerm: q || undefined,
    titleId: titleId || undefined,
  });
  const safeProfiles = safeArray(profiles);

  return (
    <div className="px-5 py-8 md:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col *:w-full lg:flex-row lg:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-[clamp(14px,7vw,36px)] font-bold text-white mb-2 w-fit">
              Profile Catalog
            </h1>
            <p className="text-white/70 w-fit">
              Browse our talented professionals
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <SearchInput />
            <RoleFilter titles={titles} />
          </div>
        </div>

        {/* Profile List or Empty State */}
        {safeProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/70">
            <p className="text-2xl font-semibold mb-4">No profiles found.</p>
            <p className="text-lg">
              {q
                ? `No results found for "${q}"`
                : "It looks like there are no professionals in our catalog yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-10">
            {safeProfiles.map((profile, idx) => {
              const title = profile.title;
              const key = `profile-card-${idx}`;

              return (
                <div key={key} className="group">
                  <Link href={`/profile/${profile.username}`}>
                    <div className="h-full flex flex-col overflow-hidden rounded-3xl bg-linear-to-br from-slate-50/10 to-slate-50/5 text-white shadow-xl transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-white/5 hover:from-slate-50/15 hover:to-slate-50/10 border border-white/10 group-hover:border-white/20">
                      <div className="mx-auto my-3 overflow-hidden rounded-full border-2 border-white/20 group-hover:border-white/30 shadow-lg ring-4 ring-white/5 group-hover:ring-white/10 transition-all duration-300">
                        {profile.profileImage?.startsWith("data:") ? (
                          <Image
                            src={profile.profileImage}
                            alt={profile.firstName}
                            width={120}
                            height={120}
                            unoptimized
                            className="object-cover object-center w-[120px] h-[120px]"
                          />
                        ) : (
                          <Image
                            src={profile.profileImage || "/file.svg"}
                            alt={profile.firstName}
                            width={120}
                            height={120}
                            className="object-cover object-center"
                          />
                        )}
                      </div>
                      <div className="mt-auto flex flex-col items-center gap-2 rounded-t-[50px] bg-linear-to-t from-white/20 to-white/10 group-hover:from-white/25 group-hover:to-white/15 px-2 py-6 md:px-4 transition-all duration-300 border-t border-white/10">
                        <p className="w-fit max-w-[80%] truncate text-center text-lg leading-none font-bold tracking-tight">
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="w-fit max-w-[80%] truncate text-center text-sm font-medium text-blue-300/90">
                          @{profile.username}
                        </p>
                        <div className="w-fit flex gap-1.5 rounded-full leading-none border border-blue-400/40 bg-linear-to-r from-blue-500/20 to-blue-600/20 px-3.5 pt-2 pb-2 text-center items-center text-sm font-semibold text-blue-100 backdrop-blur-sm shadow-lg">
                          <Briefcase size={16} className="text-blue-300" />
                          <span>{title?.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
