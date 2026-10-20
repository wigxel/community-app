"use client";
import { usePaginatedQuery } from "convex/react";
import { useMemo } from "react";
import LandingProjectCard from "~/app/_components/landing-project-card";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { BaseEmptyState } from "~/components/layouts/empty-state";
import { StandardGridSkeleton } from "~/components/layouts/grid-skeleton";
import { StandardGrid } from "~/components/layouts/grids";
import { api } from "~/convex/_generated/api";
import type { BasicProject } from "~/types/models";
import { LoadMoreButton } from "./load-more-button";

export type ProjectsProps = {
  userId: string;
  initialItems?: BasicProject[];
};

export const PAGE_SIZE = 12;

export default function ProfileProjects(props: ProjectsProps) {
  const { userId = "fallbackUserId", initialItems = [] } = props;

  const { results, status, loadMore } = usePaginatedQuery(
    api.project.listProjectByUserId,
    { userId },
    { initialNumItems: PAGE_SIZE },
  );

  const projects = useMemo(() => {
    if (results.length === 0) return initialItems;

    const paginatedIds = new Set(results.map((p) => p._id));
    const ssrOnly = initialItems.filter((p) => !paginatedIds.has(p._id));

    return [...results, ...ssrOnly];
  }, [results, initialItems]);

  if (status === "LoadingFirstPage" && projects.length === 0) {
    return (
      <StandardGridSkeleton size={PAGE_SIZE} Component={ProjectCardSkeleton} />
    );
  }

  if (projects.length === 0) {
    return <BaseEmptyState heading="No projects yet" />;
  }

  return (
    <>
      <StandardGrid className="mb-12">
        {projects.map((project) => {
          return <LandingProjectCard key={project._id} project={project} />;
        })}
      </StandardGrid>
      <LoadMoreButton status={status} onLoadMore={() => loadMore(PAGE_SIZE)} />
    </>
  );
}
