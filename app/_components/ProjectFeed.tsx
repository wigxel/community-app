"use client";

import { usePaginatedQuery } from "convex/react";
import { Loader } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import LandingProjectCard from "./LandingProjectCard";

const PAGE_SIZE = 12;
const SKELETON_KEYS = Array.from({ length: PAGE_SIZE }, (_, i) => `sk-${i}`);

function ScrollTrigger({ onVisible }: { onVisible: () => void }) {
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

export default function ProjectFeed() {
  const { results, status } = usePaginatedQuery(
    api.project.listAll,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const isLoading = status === "LoadingFirstPage";

  return (
    <section className="py-6 px-6">
      <SearchBox />

      {/* Grid */}
      {isLoading ? <GridLoader /> : <CatalogGrid />}

      {/* Empty state */}
      {!isLoading && results.length === 0 && <CatalogEmptyStateContent />}
    </section>
  );
}

function GridLoader() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SKELETON_KEYS.map((k) => (
        <ProjectCardSkeleton key={k} />
      ))}
    </div>
  );
}

function CatalogGrid() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.project.listAll,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const canLoadMore = status === "CanLoadMore";

  return (
    <>
      <div className="grid grid-cols-4 gap-[3.2rem] mb-12">
        {results.map((project) => (
          <LandingProjectCard key={project._id} project={project} />
        ))}
      </div>

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

function SearchBox() {
  const [searchTerm, setSearchTerm] = React.useState("");

  return (
    <div className="flex">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button>Search</Button>
    </div>
  );
}

function CatalogEmptyStateContent() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-2">
      <p className="text-sm">No projects yet — be the first to add one.</p>
    </div>
  );
}
