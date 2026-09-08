"use client";
import { Button } from "@hyperbridge/ui";
import {
  type PaginatedQueryReference,
  type UsePaginatedQueryReturnType,
  usePaginatedQuery,
} from "convex/react";
import type { Query } from "convex/server";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PrivateProjectCard } from "~/components/dashboard/projects/project-card";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import {
  DBCtaButton,
  DBHeader,
  DBHeaderTitle,
} from "~/components/layouts/dashboard-page-header";
import { EmptyState } from "~/components/layouts/empty-state";
import { StandardGridSkeleton } from "~/components/layouts/grid-skeleton";
import { StandardGrid } from "~/components/layouts/grids";
import { InlineLoader } from "~/components/layouts/loader";
import { FABPlusIcon } from "~/components/ui/fab-button";
import { api } from "~/convex/_generated/api";

const PAGE_LIMIT = 50;

export default function Projects() {
  const router = useRouter();

  const paginated = usePaginatedQuery(
    api.project.listProject,
    {},
    { initialNumItems: PAGE_LIMIT },
  );
  const { results, status } = paginated;
  const isInitialLoading = status === "LoadingFirstPage";
  const isEmpty = !isInitialLoading && results.length === 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-5">
        <DBHeader>
          <DBHeaderTitle text="Projects" />
        </DBHeader>

        {!isEmpty && (
          <DBCtaButton
            title="Add a project"
            onClick={() => router.push("/dashboard/projects/create")}
          >
            <FABPlusIcon />
          </DBCtaButton>
        )}
      </div>

      <EmptyState isEmpty={isEmpty}>
        <EmptyState.Content className="my-32">
          <Image
            src="/assets/images/add-files.png"
            width={120}
            height={120}
            className="aspect-square w-40"
            alt={"Empty state image"}
          />

          <EmptyState.Title>Add your first project</EmptyState.Title>
          <EmptyState.Description className="max-w-[40ch] text-center text-balance">
            Add screenshots and video media of the projects you’ve work on
            overtime
          </EmptyState.Description>

          <EmptyState.Button
            title="Add a project"
            onClick={() => {
              return router.push("/dashboard/projects/create");
            }}
          />
        </EmptyState.Content>

        <EmptyState.Conceal>
          {isInitialLoading ? (
            <StandardGridSkeleton
              size={8}
              variant="muted"
              className="opacity-50"
              Component={ProjectCardSkeleton}
            />
          ) : (
            <div className="flex flex-col gap-8">
              <StandardGrid className="mb-12">
                {results.map((project) => {
                  return <PrivateProjectCard key={project._id} {...project} />;
                })}
              </StandardGrid>
              <ConvexPagination perPage={PAGE_LIMIT} control={paginated} />
            </div>
          )}
        </EmptyState.Conceal>
      </EmptyState>
    </div>
  );
}

function ConvexPagination({
  perPage: chunk,
  control,
}: {
  perPage: number;
  control: UsePaginatedQueryReturnType<PaginatedQueryReference>;
}) {
  if (control.status === "Exhausted") return null;

  const isLoadingMore = control.status === "LoadingMore";
  const isFirstLoading = control.status === "LoadingFirstPage";

  return (
    <div className="pagination">
      <Button
        variant="outline"
        disabled={
          control.status !== "CanLoadMore" || isFirstLoading || isLoadingMore
        }
        onClick={() => control.loadMore(chunk)}
      >
        <span>Load more</span>
        {isLoadingMore ? <InlineLoader size={24} /> : null}
      </Button>
    </div>
  );
}
