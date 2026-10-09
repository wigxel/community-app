"use client";

import { Text } from "@hyperbridge/ui";
import { usePaginatedQuery } from "convex/react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { Container } from "~/components/layouts/container";
import { StandardGridSkeleton } from "~/components/layouts/grid-skeleton";
import { StandardGrid } from "~/components/layouts/grids";
import { SearchBox } from "~/components/organism/searchbox";
import { api } from "~/convex/_generated/api";
import { projectSearchConfig } from "~/lib/search-config";
import type { BasicProject } from "~/types/models";
import LandingProjectCard from "./landing-project-card";
import { ProjectModal } from "./ProjectModal";
import { SearchNoResultsState } from "./search-no-results-state";

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
  searchQuery?: string;
};

function CatalogGrid(props: CatalogGridProps) {
  const { initialProjects = [], searchQuery } = props;

  const { results, status, loadMore } = usePaginatedQuery(
    searchQuery ? api.project.search : api.project.listAll,
    searchQuery ? { q: searchQuery } : {},
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

function CatalogEmptyStateContent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 py-24 text-neutral-500">
      <Text variant="h7">No projects yet — be the first to add one.</Text>
    </div>
  );
}

function SearchPromptState() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 py-24 text-neutral-500">
      <Text variant="h7">Type something to search projects.</Text>
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
  searchQuery?: string;
  emptyPrompt?: boolean;
};

export default function PublicProjectsCatalog({
  initialProjects,
  ssrError,
  searchQuery,
  emptyPrompt,
}: PublicProjectsCatalogProps) {
  const router = useRouter();

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  if (ssrError) {
    return (
      <Container level="max" className="flex flex-col gap-[3.2rem]">
        <Suspense>
          <SearchBox config={projectSearchConfig} onSearch={handleSearch} />
        </Suspense>
        <SsrErrorState />
      </Container>
    );
  }

  const hasInitialData = initialProjects && initialProjects.length > 0;
  const isSearchWithNoResults =
    searchQuery && !emptyPrompt && initialProjects?.length === 0;

  return (
    <Container level="max" className="flex flex-col gap-[3.2rem]">
      <Suspense>
        <SearchBox config={projectSearchConfig} onSearch={handleSearch} />
      </Suspense>

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

      {/* Empty state */}
      {!emptyPrompt && hasInitialData && initialProjects.length === 0 && (
        <CatalogEmptyStateContent />
      )}
    </Container>
  );
}
