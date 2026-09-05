"use client";

import {
  EmptyStateConceal,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateTitle,
  Text,
} from "@hyperbridge/ui";
import { useQuery } from "convex/react";
import { HeartCrack } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "~/components/layouts/empty-state";
import { StandardGridSkeleton } from "~/components/layouts/grid-skeleton";
import { api } from "~/convex/_generated/api";
import type { FavouritedProject } from "~/types/models";
import { FavouritedProjectCard } from "./_components/FavouritedProjectCard";
import { FavouritedProjectCardSkeleton } from "./_components/FavouritedProjectCardSkeleton";

export default function FavouritesPage() {
  const favourites = useQuery(api.favourites.listMyFavourites);
  const isLoading = favourites === undefined;

  return (
    <div className="mb-12 flex flex-col gap-8">
      <hgroup className="flex flex-col gap-0.5">
        <Text variant="h4" className="text-4xl font-semibold">
          Favourites
        </Text>
        <p className="text-foreground text-base">
          Projects you have favourited across the community
        </p>
      </hgroup>

      {isLoading ? (
        <StandardGridSkeleton
          variant="muted"
          Component={FavouritedProjectCardSkeleton}
        />
      ) : (
        <EmptyState isEmpty={favourites.length === 0}>
          <EmptyStateContent>
            <Image
              src="/assets/images/add-files.png"
              width={120}
              height={120}
              className="aspect-square w-40"
              alt={"Empty state image"}
            />

            <EmptyStateTitle>No favourites yet</EmptyStateTitle>
            <EmptyStateDescription>
              Browse the community feed and heart a project to save it here.
            </EmptyStateDescription>
          </EmptyStateContent>

          <EmptyStateConceal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favourites.map((project) => (
                <FavouritedProjectCard
                  key={project._id}
                  project={project as FavouritedProject}
                />
              ))}
            </div>
          </EmptyStateConceal>
        </EmptyState>
      )}
    </div>
  );
}
