"use client";

import { useQuery } from "convex/react";
import React, { useState } from "react";
import { useEvent } from "react-use-event-hook";
import { EmptyState } from "~/components/layouts/empty-state";
import { FullscreenLoader } from "~/components/layouts/loader";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { api } from "~/convex/_generated/api";
import { Result } from "~/lib/result";
import type { Project } from "~/types/models";
import { ProjectDetails } from "./project-details";

const EMPTY_VALUE = "unset";

export function ProjectModal() {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = React.useState<string | null>(null);

  const project_res = useQuery(api.project.getProject, { id: projectId });

  const handleHashChange = useEvent(() => {
    const url_hash = window.location.hash;
    const regex = /^#preview:(.+)/;
    const matchingId = regex.exec(url_hash)?.[1];

    if (matchingId === EMPTY_VALUE) return;
    if (matchingId == null) return;

    if (projectId === matchingId) {
      return setOpen(false);
    }

    setOpen(true);
    setProjectId(matchingId);
  });

  React.useEffect(() => {
    const controller = new AbortController();

    window.addEventListener("popstate", handleHashChange, {
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [handleHashChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpenState) => {
        setOpen(isOpenState);
        setProjectId(null);

        setTimeout(() => {
          window.location.hash = `#preview:${EMPTY_VALUE}`;
        }, 16);
      }}
    >
      <DialogContent className="aspect-4/6 max-h-[90svh] w-full max-w-2xl gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">
          {Result.match(project_res, {
            loading: () => "Loading...",
            success: (project) => project?.title,
            error: () => "Not found",
          })}
        </DialogTitle>

        {Result.match(project_res, {
          loading: () => {
            return <FullscreenLoader />;
          },
          success: (project) => {
            return <ProjectDetails project={project as Project} />;
          },
          error: () => {
            return (
              <EmptyState isEmpty={true}>
                <EmptyState.Content>
                  <EmptyState.Title>Not project found</EmptyState.Title>
                  <EmptyState.Description>
                    The project you're looking for doesn't exist or has been
                    removed
                  </EmptyState.Description>
                </EmptyState.Content>
              </EmptyState>
            );
          },
        })}
      </DialogContent>
    </Dialog>
  );
}
