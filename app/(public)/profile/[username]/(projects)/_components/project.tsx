import { fetchQuery } from "convex/nextjs";
import LandingProjectCard from "~/app/_components/landing-project-card";
import { StandardGrid } from "~/components/layouts/grids";
import { api } from "~/convex/_generated/api";
import { LoadMoreButton } from "./load-more-button";

export type ProjectsProps = { userId?: string };

// @todo: paginate profile projects. add a load more button.
// use <CatalogGrid /> implementation
// also see relative <LoadMoreButton />
export default async function ProfileProjects(props: ProjectsProps) {
  const { userId = "#" } = props;

  const safeProjects = await fetchQuery(api.project.listProjectByUserId, {
    userId,
  });

  return (
    <>
      <StandardGrid className="mb-12">
        {safeProjects.map((project) => {
          return <LandingProjectCard key={project._id} project={project} />;
        })}
      </StandardGrid>
      <LoadMoreButton />
    </>
  );
}
