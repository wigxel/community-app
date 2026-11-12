import { fetchQuery } from "convex/nextjs";
import LandingProjectCard from "~/app/_components/landing-project-card";
import { Marquee } from "~/components/molecules/marquee";
import { api } from "~/convex/_generated/api";
import { safeArray } from "~/lib/data.helpers";

// @todo: create a query for this and integrate. query should be list featured.
export async function DiscoverMoreProjects() {
  const { page: projects } = await fetchQuery(api.project.listAll, {
    paginationOpts: {
      numItems: 20,
      cursor: null,
    },
  });

  const safeProjects = safeArray(projects);

  return (
    <div className="py-24">
      <hgroup className="mb-6 px-4">
        <h3 className="text-2xl font-semibold">Discover more...</h3>
      </hgroup>

      <Marquee
        items={safeProjects}
        renderItem={(project) => (
          <div key={project._id} className="min-w-[clamp(200px,20svw,300px)]">
            <LandingProjectCard project={project} />
          </div>
        )}
      />
    </div>
  );
}
