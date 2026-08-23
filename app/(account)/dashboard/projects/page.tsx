"use client";
import { Text } from "@hyperbridge/ui";
import { usePaginatedQuery } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProjectCard } from "~/components/dashboard/projects/project-card";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { EmptyState } from "~/components/layouts/empty-state";
import { StandardGridSkeleton } from "~/components/layouts/grid-skeleton";
import { FABPlusIcon, FAButton } from "~/components/ui/fab-button";
import { api } from "~/convex/_generated/api";

export default function Projects() {
  const router = useRouter();

  const { results, status } = usePaginatedQuery(
    api.project.listProject,
    {},
    { initialNumItems: 50 },
  );

  const isInitialLoading = status === "LoadingFirstPage";

  const isEmpty = !isInitialLoading && results.length === 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-5">
        <Text variant={"h4"}>Projects</Text>

        {!isEmpty && (
          <FAButton
            title="Add a project"
            className="size-24"
            onClick={() => router.push("/dashboard/projects/edit")}
          >
            <FABPlusIcon />
          </FAButton>
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
              return router.push("/dashboard/projects/edit");
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
              {results.map((project) => {
                return <ProjectCard key={project._id} {...project} />;
              })}
            </div>
          )}
        </EmptyState.Conceal>
      </EmptyState>
    </div>
  );
}
