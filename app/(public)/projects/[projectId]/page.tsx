import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProjectDetails } from "~/app/_components/project-details";
import { Container } from "~/components/layouts/container";
import { api } from "~/convex/_generated/api";
import { Result } from "~/lib/result";
import type { BasicProject } from "~/types/models";

export const revalidate = 30;

type PageProps = {
  params: Promise<{ projectId: string }>;
};

const getProject = cache((id: string) => {
  return fetchQuery(api.project.getProject, { id }).catch(() => null);
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { projectId } = await params;
  const response = await getProject(projectId);
  const project = Result.match(response, {
    loading: () => null,
    error: () => null,
    success: (data) => data as BasicProject,
  });

  return { title: project?.title ?? "Project Not Found" };
}

export default async function ProjectsPage({ params }: PageProps) {
  const { projectId } = await params;

  const project_response = await getProject(projectId);

  return Result.match(project_response, {
    error: () => {
      return notFound();
    },
    success: (project) => {
      return (
        <Container level={"max"}>
          <ProjectDetails project={project as BasicProject} />
        </Container>
      );
    },
  });
}
