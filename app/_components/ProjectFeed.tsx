"use client";

import { usePaginatedQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { api } from "~/convex/_generated/api";
import LandingProjectCard from "./LandingProjectCard";

const PAGE_SIZE = 12;
const SKELETON_KEYS = Array.from({ length: PAGE_SIZE }, (_, i) => `sk-${i}`);
const SKELETON_MORE_KEYS = ["sk-more-0", "sk-more-1", "sk-more-2"];

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
  const { results, status, loadMore } = usePaginatedQuery(
    api.project.listAll,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const isLoading = status === "LoadingFirstPage";
  const canLoadMore = status === "CanLoadMore";

  return (
    <section className="py-6 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Community Projects
          </h2>
          <p className="text-sm text-neutral-500">
            Work shipped by members of the community
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? SKELETON_KEYS.map((k) => <ProjectCardSkeleton key={k} />)
            : results.map((project) => (
                <LandingProjectCard key={project._id} project={project} />
              ))}
        </div>

        {/* Loading more skeletons */}
        {status === "LoadingMore" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {SKELETON_MORE_KEYS.map((k) => (
              <ProjectCardSkeleton key={k} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-2">
            <p className="text-sm">
              No projects yet — be the first to add one.
            </p>
          </div>
        )}

        {/* Scroll trigger */}
        {canLoadMore && <ScrollTrigger onVisible={() => loadMore(PAGE_SIZE)} />}
      </div>
    </section>
  );
}
