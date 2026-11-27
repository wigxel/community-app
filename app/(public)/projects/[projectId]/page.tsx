import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { ProjectDetails } from "~/app/_components/project-details";
import { UnpublishedPreviewFab } from "~/app/_components/unpublished-preview-fab";
import { Container } from "~/components/layouts/container";
import { DiscoverMoreProjects } from "~/components/organism/discover-more-projects";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { fetchAuthQuery } from "~/lib/auth-server";
import { ProjectImpl } from "~/lib/factories/project";
import { Result } from "~/lib/result";
import type { BasicProject } from "~/types/models";

export const revalidate = 30;

type PageProps = {
  params: Promise<{ projectId: string }>;
};

// Draft Mode bypasses the ISR cache automatically, so draft viewers get a
// fresh per-request render while everyone else keeps the cached one.
const getProject = cache(async (id: string, draft: boolean) => {
  return draft
    ? await fetchAuthQuery(api.project.getProject, { id }).catch(() => null)
    : await fetchQuery(api.project.getProject, { id }).catch(() => null);
});

const getProjectBySlug = cache(async (slug: string, draft: boolean) => {
  return draft
    ? await fetchAuthQuery(api.project.getProjectBySlug, { slug }).catch(
        () => null,
      )
    : await fetchQuery(api.project.getProjectBySlug, { slug }).catch(
        () => null,
      );
});

const baseUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://community-app-wigxel.vercel.app"
).replace(/\/+$/, "");

const getProjectUrl = (project: BasicProject) =>
  `${baseUrl}${ProjectImpl.url(project)}`;

/**
 * Resolve the route param: it is usually a slug, but a raw doc id still works
 * by redirecting to its slug URL. Legacy projects without a slug render under
 * the doc id until backfill.
 */
const loadProject = async (param: string, draft: boolean) => {
  const bySlug = await getProjectBySlug(param, draft);
  const slugProject = Result.match(bySlug, {
    error: () => null,
    success: (data) => data,
  });
  if (slugProject) return { project: slugProject, slug: param };

  const byId = await getProject(param, draft);
  return Result.match(byId, {
    error: () => null,
    success: (project) => {
      if (project.slug) redirect(`/projects/${project.slug}`);
      return { project, slug: project._id };
    },
  });
};

function getProjectJsonLd({
  project,
  url,
}: {
  project: BasicProject;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url,
    author: {
      "@type": "Person",
      name: project.ownerName,
      alternateName: project.username,
    },
    dateCreated: new Date(project._creationTime).toISOString(),
    dateModified: project.lastUpdatedAt
      ? new Date(project.lastUpdatedAt).toISOString()
      : undefined,
    keywords: project.tags ?? [],
  };
}

type JsonLdProps = { data: Record<string, unknown> };

function JsonLd(props: JsonLdProps) {
  const { data } = props;

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized and escapes HTML-sensitive characters.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

async function exitPreview() {
  "use server";
  const draft = await draftMode();
  draft.disable();
  redirect("/dashboard/projects");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { projectId: param } = await params;
  const draft = await draftMode();
  const loaded = await loadProject(param, draft.isEnabled);

  if (!loaded) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  if (draft.isEnabled && !loaded.project.published) {
    return {
      title: loaded.project.title,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const project = loaded.project;
  const title = project.title;
  const description =
    project.description || `Explore ${project.title} on Reveer.`;

  const projectUrl = getProjectUrl(loaded.project);

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
  const { projectId: param } = await params;
  const draft = await draftMode();
  const loaded = await loadProject(param, draft.isEnabled);

  if (!loaded) notFound();

  // Legacy projects have no long-form row (null); invalid ids throw → null.
  const longDescription = await fetchQuery(
    api.projectDescription.getProjectDescription,
    { projectId: loaded.project._id as Id<"project"> },
  ).catch(() => null);

  return (
    <Container level={"max"}>
      {draft.isEnabled && !loaded.project.published && (
        <UnpublishedPreviewFab
          projectId={loaded.project._id}
          exitPreview={exitPreview}
        />
      )}

      <JsonLd
        data={getProjectJsonLd({
          project: loaded.project,
          url: getProjectUrl(loaded.project),
        })}
      />
      <ProjectDetails
        project={loaded.project}
        longDescription={longDescription}
      />
      <DiscoverMoreProjects />
    </Container>
  );
}
