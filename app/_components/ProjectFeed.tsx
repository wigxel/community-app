"use client";

import { usePaginatedQuery } from "convex/react";
import { Loader } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { SearchIcon } from "~/components/icons";
import { Container } from "~/components/layouts/container";
import { StandardGridSkeleton } from "~/components/layouts/grid-skeleton";
import { StandardGrid } from "~/components/layouts/grids";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import LandingProjectCard from "./LandingProjectCard";
import { ProjectModal } from "./ProjectModal";

const PAGE_SIZE = 12;

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

function CatalogGrid() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.project.listAll,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const canLoadMore = status === "CanLoadMore";

  return (
    <>
      <ProjectModal />

      <StandardGrid className="mb-12">
        {results.map((project) => (
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
    <div className="flex gap-2 flex-col">
      <label className="flex bg-muted/50 focus-within:bg-muted py-[0.4rem] ps-4 pe-[0.4em] rounded-xl gap-4 items-center">
        <SearchIcon className="text-muted-foreground size-4.5" />
        <div className="flex-1 relative self-stretch">
          <input
            type="text"
            className="text-base absolute inset-0 outline-none"
            placeholder="What you looking for?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button size="lg" className="rounded-xl">
          Search
        </Button>
      </label>

      <div className="text-xs text-foreground inline-flex items-center gap-2 mb-4 px-[1.8em]">
        {/* @todo: Integrate this */}
        <span className="inline-block">Popular &nbsp;&nbsp;—&nbsp;&nbsp;</span>
        <span className="inline-flex gap-2">
          {["Web3", "E-commerce", "Blog", "Fintech"].map((tag) => {
            return (
              <span
                key={tag}
                className="inline-block rounded-sm p-1 cursor-pointer hover:text-accent-foreground hover:bg-muted"
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
    <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-2">
      <p className="text-sm">No projects yet — be the first to add one.</p>
    </div>
  );
}

export default function PublicProjectsCatalog() {
  const { results, status } = usePaginatedQuery(
    api.project.listAll,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const isLoading = status === "LoadingFirstPage";

  return (
    <Container level="max" className="flex flex-col gap-[3.2rem]">
      <SearchBox />

      {/* Grid */}
      {isLoading ? (
        <StandardGridSkeleton
          size={PAGE_SIZE}
          Component={ProjectCardSkeleton}
        />
      ) : (
        <CatalogGrid />
      )}

      {/* Empty state */}
      {!isLoading && results.length === 0 && <CatalogEmptyStateContent />}
    </Container>
  );
}
