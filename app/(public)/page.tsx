import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";
import PublicProjectsCatalog from "../_components/ProjectFeed";
import { LandingHero } from "./_components/landing-page-hero";

export const revalidate = 30;

const SSR_PAGE_SIZE = 12;

export default async function Home() {
  const initialData = await fetchQuery(api.project.listAll, {
    paginationOpts: { numItems: SSR_PAGE_SIZE, cursor: null },
  }).catch(() => null);

  return (
    <div className="container mx-auto">
      {/* Hero section */}
      <LandingHero />

      {/* Project Catalog */}
      <PublicProjectsCatalog
        initialProjects={initialData?.page}
        ssrError={!initialData}
      />
    </div>
  );
}
