"use client";

import { Text } from "@hyperbridge/ui";
import { usePaginatedQuery } from "convex/react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import LandingProjectCard from "~/app/_components/landing-project-card";
import { ProjectModal } from "~/app/_components/ProjectModal";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { Container } from "~/components/layouts/container";
import { StandardGridSkeleton } from "~/components/layouts/grid-skeleton";
import { StandardGrid } from "~/components/layouts/grids";
import { SearchBoxSubmit } from "~/components/organism/searchbox";
import { api } from "~/convex/_generated/api";
import type { BasicProject } from "~/types/models";

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
  searchQuery: string;
};

function CatalogGrid(props: CatalogGridProps) {
  const { initialProjects = [], searchQuery } = props;

  const { results, status, loadMore } = usePaginatedQuery(
    api.project.search,
    { q: searchQuery },
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

      <ProjectModal />
    </>
  );
}

function SearchPromptState() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 py-24 text-neutral-500">
      <Text variant="h7">Type something to search projects.</Text>
    </div>
  );
}

type SearchNoResultsStateProps = { query: string };

function SearchNoResultsState(props: SearchNoResultsStateProps) {
  const { query } = props;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 py-24 text-neutral-500">
      <Text variant="h7">No projects match &ldquo;{query}&rdquo;.</Text>
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

type SearchProjectsCatalogProps = {
  initialProjects?: BasicProject[];
  ssrError?: boolean;
  searchQuery: string;
  emptyPrompt?: boolean;
};

export default function SearchProjectsCatalog(
  props: SearchProjectsCatalogProps,
) {
  const { initialProjects, ssrError, searchQuery, emptyPrompt } = props;

  const router = useRouter();

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const searchInput = (
    <div className="slice-backdrop-effect sticky top-(--header-height) z-90">
      <SearchBoxSubmit
        defaultValue={searchQuery}
        onSubmit={handleSearch}
        placeholder="What you looking for?"
      />
    </div>
  );

  if (ssrError) {
    return (
      <Container
        level="max"
        className="flex min-h-screen flex-col gap-[3.2rem]"
      >
        {searchInput}
        <SsrErrorState />
      </Container>
    );
  }

  const hasInitialData = initialProjects && initialProjects.length > 0;
  const isSearchWithNoResults = !emptyPrompt && initialProjects?.length === 0;

  return (
    <Container level="max" className="flex min-h-screen flex-col gap-[3.2rem]">
      {searchInput}

      {isSearchWithNoResults ? (
        <SearchNoResultsState query={searchQuery} />
      ) : emptyPrompt ? (
        <SearchPromptState />
      ) : hasInitialData ? (
        <CatalogGrid
          initialProjects={initialProjects}
          searchQuery={searchQuery}
        />
      ) : (
        <StandardGridSkeleton
          size={PAGE_SIZE}
          Component={ProjectCardSkeleton}
        />
      )}
    </Container>
  );
}
