import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetails } from "~/app/_components/project-details";
import { Container } from "~/components/layouts/container";
import { api } from "~/convex/_generated/api";
import { Result } from "~/lib/result";
import type { BasicProject } from "~/types/models";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { projectId } = await params;

  const project_response = await fetchQuery(api.project.getProject, {
    id: projectId,
  }).catch(() => null);

  if (!project_response) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const project = Result.match(project_response, {
    error: () => null,
    success: (data) => data,
  });

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = project.title;
  const description =
    project.description || `Explore ${project.title} on Reveer.`;

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://community-app-wigxel.vercel.app"
  ).replace(/\/+$/, "");

  const projectUrl = `${baseUrl}/projects/${projectId}`;

  const firstPhoto = project.media.find((media) => media.type === "photo");

  const ogImageUrl = firstPhoto?.metadata.url;

  return {
    title,
    description,

    alternates: {
      canonical: projectUrl,
    },

    openGraph: {
      title,
      description,
      url: projectUrl,
      siteName: "Reveer",
      type: "website",
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                alt: `${title} project preview`,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}

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
      const basicProject = project as BasicProject;

      const baseUrl = (
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://community-app-wigxel.vercel.app"
      ).replace(/\/+$/, "");

      const projectUrl = `${baseUrl}/projects/${projectId}`;

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: basicProject.title,
        description: basicProject.description,
        url: projectUrl,
        author: {
          "@type": "Person",
          name: basicProject.ownerName,
          alternateName: basicProject.username,
        },
        dateCreated: new Date(basicProject._creationTime).toISOString(),
        dateModified: basicProject.lastUpdatedAt
          ? new Date(basicProject.lastUpdatedAt).toISOString()
          : undefined,
        keywords: basicProject.tags ?? [],
      };

      return (
        <Container level={"max"}>
          <script
            type="application/ld+json"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized and escapes HTML-sensitive characters.
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
            }}
          />
          <ProjectDetails project={basicProject} />
        </Container>
      );
    },
  });
}
