"use client";
import { Text } from "@hyperbridge/ui";

export function SearchPromptState() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 py-24 text-neutral-500">
      <Text variant="h7">Type something to search projects.</Text>
    </div>
  );
}
