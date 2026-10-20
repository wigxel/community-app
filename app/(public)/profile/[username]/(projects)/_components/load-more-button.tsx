"use client";
import { Button } from "@hyperbridge/ui";
import React from "react";
import { createPortal } from "react-dom";

export const LOAD_MORE_PORTAL_ID = "profile-page-load-more-portal";

export type LoadMoreButtonProps = {
  status?: "LoadingFirstPage" | "LoadingMore" | "CanLoadMore" | "Exhausted";
  onLoadMore?: () => void;
};

export function LoadMoreButton(props: LoadMoreButtonProps) {
  const { status, onLoadMore } = props;
  const [parent, setMountParent] = React.useState<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    const element = document.querySelector(
      `#${LOAD_MORE_PORTAL_ID}`,
    ) as HTMLElement | null;

    console.assert(
      !!element,
      `Element with id required for LoadMoreButton to function #${LOAD_MORE_PORTAL_ID}`,
    );

    setMountParent(element);
  }, []);

  if (!parent) return;
  if (status === "Exhausted") return null;

  const isLoading = status === "LoadingMore" || status === "LoadingFirstPage";

  return createPortal(
    <Button
      className="w-full"
      size="lg"
      variant={isLoading ? "level_1" : "default"}
      disabled={isLoading}
      onClick={onLoadMore}
    >
      Load more
    </Button>,
    parent,
  );
}
