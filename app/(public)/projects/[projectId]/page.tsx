import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { ProjectDetails } from "~/app/_components/project-details";
import { Container } from "~/components/layouts/container";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Result } from "~/lib/result";
import type { BasicProject } from "~/types/models";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectsPage({ params }: PageProps) {
  const { projectId } = await params;

  const project_response = await fetchQuery(api.project.getProject, {
    id: projectId,
  }).catch(() => null);

  // Legacy projects have no long-form row; fetchQuery returns null then.
  const longDescription = await fetchQuery(
    api.projectDescription.getProjectDescription,
    { projectId: projectId as Id<"project"> },
  ).catch(() => null);

  return Result.match(project_response, {
    error: () => {
      return notFound();
    },
    success: (project) => {
      return (
        <Container level={"max"}>
          <ProjectDetails
            project={project as BasicProject}
            longDescription={longDescription}
          />
        </Container>
      );
    },
  });
}
