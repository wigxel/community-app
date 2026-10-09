"use client";

import { Text } from "@hyperbridge/ui";

export function SearchNoResultsState({ query }: { query: string }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 py-24 text-neutral-500">
      <Text variant="h7">No projects match &ldquo;{query}&rdquo;.</Text>
    </div>
  );
}
