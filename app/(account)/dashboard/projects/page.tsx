"use client";
import { useQuery } from "convex/react";
import { Pencil } from "lucide-react";
import { RedirectType, redirect, useRouter } from "next/navigation";
import { ProjectCard } from "~/components/dashboard/projects/project-card";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";

export default function Projects() {
  const projects = useQuery(api.project.listProject);
  const isFetching = projects === undefined;
  const router = useRouter();

  if (projects && projects.length < 1)
    redirect("/dashboard/projects/edit", RedirectType.replace);

  return (
    <div>
      <div className="mb-8 flex justify-between items-center gap-5">
        <h1 className="text-4xl font-semibold">Projects</h1>
        {!isFetching && (
          <Button
            variant={"secondary"}
            size={"sm"}
            onClick={() => router.push("/dashboard/projects/edit")}
          >
            <Pencil /> Edit
          </Button>
        )}
      </div>

      {isFetching ? (
        <ProjectCardSkeleton />
      ) : (
        projects &&
        projects.length > 0 && (
          <div className="flex flex-col gap-8">
            {projects.map((project) => {
              return <ProjectCard key={project._id} {...project} />;
            })}
          </div>
        )
      )}
    </div>
  );
}
