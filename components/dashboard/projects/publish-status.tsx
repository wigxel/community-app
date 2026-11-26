"use client";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { intersperse } from "effect/Array";
import { api } from "~/convex/_generated/api";
import { Result } from "~/lib/result";
import { cn } from "~/lib/utils";

// Reflects the saved state (what the public site shows), not the unsaved checkbox.

export type PublishStatusProps = { projectId: string };

export function PublishStatus(props: PublishStatusProps) {
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
