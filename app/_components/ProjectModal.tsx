"use client";

import { useQuery } from "convex/react";
import React, { useState } from "react";
import { useEvent } from "react-use-event-hook";
import { Drawer } from "vaul";
import { EmptyState } from "~/components/layouts/empty-state";
import { FullscreenLoader } from "~/components/layouts/loader";
import { api } from "~/convex/_generated/api";
import { Result } from "~/lib/result";
import type { FullProject } from "~/types/models";
import { ProjectDetails } from "./project-details";

const EMPTY_VALUE = "unset";
const snapPoints = ["148px", "355px", 1];

export function ProjectModal() {
  // const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  const project_res = useQuery(api.project.getProject, { id: projectId });

  const handleHashChange = useEvent(() => {
    const url_hash = window.location.hash;
    const regex = /^#preview:(.+)/;
    const matchingId = regex.exec(url_hash)?.[1];

    if (matchingId === EMPTY_VALUE) return;
    if (matchingId == null) return;

    if (projectId === matchingId) {
      return setSnap(snapPoints[2]);
    }

    setSnap(snapPoints[0]);
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
    <Drawer.Root
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      onOpenChange={(isOpenState) => {
        if (isOpenState === true) return;

        setSnap(snapPoints[0]);
        setProjectId(null);

        setTimeout(() => {
          window.location.hash = `#preview:${EMPTY_VALUE}`;
        }, 16);
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-muted">
          <Drawer.Handle />

          <Drawer.Title className="sr-only">
            {Result.match(project_res, {
              loading: () => "Loading...",
              success: (project) => project?.title,
              error: () => "Not found",
            })}
          </Drawer.Title>

          {Result.match(project_res, {
            loading: () => {
              return <FullscreenLoader />;
            },
            success: (project) => {
              return <ProjectDetailsPopup project={project as Project} />;
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
        </DialogTitle>

        {Result.match(project_res, {
          loading: () => {
            return <FullscreenLoader />;
          },
          success: (project) => {
            return <ProjectDetails project={project as FullProject} />;
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
