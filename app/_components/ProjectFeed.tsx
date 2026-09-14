"use client";

import { Text } from "@hyperbridge/ui";
import { usePaginatedQuery } from "convex/react";
import { Loader } from "lucide-react";
import React, { useEffect, useMemo, useRef } from "react";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { SearchIcon } from "~/components/icons";
import { Container } from "~/components/layouts/container";
import { StandardGridSkeleton } from "~/components/layouts/grid-skeleton";
import { StandardGrid } from "~/components/layouts/grids";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { BasicProject } from "~/types/models";
import LandingProjectCard from "./landing-project-card";
import { ProjectModal } from "./ProjectModal";

const PAGE_SIZE = 12;

type ScrollTriggerProps = { onVisible: () => void };
function ScrollTrigger(props: ScrollTriggerProps) {
  const { onVisible } = props;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onVisible();
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible]);

  return <div ref={ref} aria-hidden="true" />;
}

type CatalogGridProps = {
  initialProjects?: BasicProject[];
};

function CatalogGrid(props: CatalogGridProps) {
  const { initialProjects = [] } = props;

  const { results, status, loadMore } = usePaginatedQuery(
    api.project.listAll,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const projects = useMemo(() => {
    if (results.length === 0) return initialProjects;

    const paginatedIds = new Set(results.map((p) => p._id));
    const ssrOnly = initialProjects.filter((p) => !paginatedIds.has(p._id));

    return [...results, ...ssrOnly];
  }, [results, initialProjects]);

  const canLoadMore = status === "CanLoadMore";

  return (
    <>
      <ProjectModal />

      <StandardGrid className="mb-12">
        {projects.map((project) => (
          <LandingProjectCard key={project._id} project={project} />
        ))}
      </StandardGrid>

      {status === "LoadingMore" ? (
        <span className="animate-spin">
          <Loader />
        </span>
      ) : null}

      {/* Scroll trigger */}
      {canLoadMore && <ScrollTrigger onVisible={() => loadMore(PAGE_SIZE)} />}
    </>
  );
}

// @todo: Integrate search function. url should be the source of truth
function SearchBox() {
  const [searchTerm, setSearchTerm] = React.useState("");

  return (
    <div className="flex flex-col gap-2">
      <label className="bg-muted/50 focus-within:bg-muted flex items-center gap-4 rounded-xl py-[0.4rem] ps-4 pe-[0.4em]">
        <SearchIcon className="text-muted-foreground size-4.5" />
        <div className="relative flex-1 self-stretch">
          <input
            type="text"
            className="absolute inset-0 text-base outline-none"
            placeholder="What you looking for?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button size="lg" className="rounded-xl">
          Search
        </Button>
      </label>

      <div className="text-foreground mb-4 inline-flex items-center gap-2 px-[1.8em] text-xs">
        {/* @todo: Integrate this */}
        <span className="inline-block">Popular &nbsp;&nbsp;—&nbsp;&nbsp;</span>
        <span className="inline-flex gap-2">
          {["Web3", "E-commerce", "Blog", "Fintech"].map((tag) => {
            return (
              <span
                key={tag}
                className="hover:text-accent-foreground hover:bg-muted inline-block cursor-pointer rounded-sm p-1"
              >
                {tag}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
}

function CatalogEmptyStateContent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 py-24 text-neutral-500">
      <Text variant="h7">No projects yet — be the first to add one.</Text>
    </div>
  );
}

function SsrErrorState() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 py-24 text-neutral-500">
      <Text variant="h7">Failed to load projects. Please try again later.</Text>
    </div>
  );
}

type PublicProjectsCatalogProps = {
  initialProjects?: BasicProject[];
  ssrError?: boolean;
};

export default function PublicProjectsCatalog({
  initialProjects,
  ssrError,
}: PublicProjectsCatalogProps) {
  if (ssrError) {
    return (
      <Container level="max" className="flex flex-col gap-[3.2rem]">
        <SearchBox />
        <SsrErrorState />
      </Container>
    );
  }

  const hasInitialData = initialProjects && initialProjects.length > 0;

  return (
    <Container level="max" className="flex flex-col gap-[3.2rem]">
      <SearchBox />

      {/* Grid */}
      {hasInitialData ? (
        <CatalogGrid initialProjects={initialProjects} />
      ) : (
        <StandardGridSkeleton
          size={PAGE_SIZE}
          Component={ProjectCardSkeleton}
        />
      )}

      {/* Empty state */}
      {hasInitialData && initialProjects.length === 0 && (
        <CatalogEmptyStateContent />
      )}
    </Container>
  );
}
