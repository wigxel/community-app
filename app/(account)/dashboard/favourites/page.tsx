"use client";

import { useQuery } from "convex/react";
import { Heart, HeartCrack } from "lucide-react";
import Link from "next/link";
import { api } from "~/convex/_generated/api";
import type { FavouritedProject } from "~/types/models";
import { FavouritedProjectCard } from "./_components/FavouritedProjectCard";
import { FavouritedProjectCardSkeleton } from "./_components/FavouritedProjectCardSkeleton";

const skeletonIds = [
  "skeleton-1",
  "skeleton-2",
  "skeleton-3",
  "skeleton-4",
  "skeleton-5",
  "skeleton-6",
];

export default function FavouritesPage() {
  const favourites = useQuery(api.favourites.listMyFavourites);
  const isLoading = favourites === undefined;

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-400/30">
          <Heart size={18} className="text-rose-300 fill-rose-300" />
        </div>
        <div>
          <h1 className="text-4xl font-semibold">Favourites</h1>
          <p className="mt-1 text-base text-white/50">
            Projects you have favourited across the community
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonIds.map((id) => (
            <FavouritedProjectCardSkeleton key={id} />
          ))}
        </div>
      ) : favourites.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/15 bg-white/5 py-20 text-center">
          <HeartCrack size={36} className="text-white/20" />
          <div>
            <p className="text-base font-medium text-white/60">
              No favourites yet
            </p>
            <p className="mt-1 text-sm text-white/30">
              Browse the community feed and heart a project to save it here.
            </p>
          </div>
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-500 hover:bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors"
          >
            Browse projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favourites.map((project) => (
            <FavouritedProjectCard
              key={project._id}
              project={project as FavouritedProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
