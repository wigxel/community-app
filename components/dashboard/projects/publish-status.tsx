"use client";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { intersperse } from "effect/Array";
import { api } from "~/convex/_generated/api";
import { Result } from "~/lib/result";
import { cn } from "~/lib/utils";

/**
 * Saved publication state of the project, shown opposite the page heading.
 * Reads the same query the edit form uses (Convex dedupes them) and live-
 * updates when a save lands. Reflects what the public site shows right
 * now, not the unsaved checkbox in the form.
 */
export function PublishStatus(props: { projectId: string }) {
  const project = useQuery(api.project.getProject, { id: props.projectId });

  const data = Result.match(project, {
    loading: () => null,
    error: () => null,
    success: (data) => data,
  });

  if (!data) return null;

  const isUnpublished = data.published === false;

  return (
    <p className="flex items-center gap-2 self-start text-sm leading-none">
      {intersperse(
        [
          <span
            key="publish-status"
            className={cn(
              isUnpublished ? "text-amber-300" : "text-muted-foreground",
            )}
          >
            {isUnpublished ? "Unpublished" : "Published"}
          </span>,

          data.lastUpdatedAt != null && (
            <span className="text-muted-foreground">
              Updated{" "}
              {formatDistanceToNow(data.lastUpdatedAt, { addSuffix: true })}
            </span>
          ),
        ],
        <span>•</span>,
      )}
    </p>
  );
}
