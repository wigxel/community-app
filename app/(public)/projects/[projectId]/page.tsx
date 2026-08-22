import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { ProjectDetails } from "~/app/_components/project-details";
import { Container } from "~/components/layouts/container";
import { api } from "~/convex/_generated/api";
import { Result } from "~/lib/result";
import type { Project } from "~/types/models";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectsPage({ params }: PageProps) {
  const { projectId } = await params;

  const project_response = await fetchQuery(api.project.getProject, {
    id: projectId,
  }).catch(() => null);

  return Result.match(project_response, {
    error: () => {
      return notFound();
    },
    success: (project) => {
      return (
        <Container level={"max"}>
          <ProjectDetails project={project as Project} />
        </Container>
      );
    },
  });
}
