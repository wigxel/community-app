// app/(public)/search/page.tsx
import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";
import SearchProjectsCatalog from "./_components/search-catalog";

export const revalidate = 30;

const SSR_PAGE_SIZE = 12;

export type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage(props: SearchPageProps) {
  const { searchParams } = props;

  const { q = "" } = await searchParams;
  const trimmed = q.trim();

  const initialData = await fetchQuery(api.project.search, {
    paginationOpts: { numItems: SSR_PAGE_SIZE, cursor: null },
    q: trimmed,
  }).catch(() => null);

  return (
    <div className="container mx-auto">
      <SearchProjectsCatalog
        initialProjects={initialData?.page}
        ssrError={!initialData}
        searchQuery={trimmed}
        emptyPrompt={!trimmed}
      />
    </div>
  );
}
