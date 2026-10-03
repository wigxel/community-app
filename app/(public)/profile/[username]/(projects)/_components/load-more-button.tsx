"use client";
import { Button } from "@hyperbridge/ui";
import React from "react";
import { createPortal } from "react-dom";

export const LOAD_MORE_PORTAL_ID = "profile-page-load-more-portal";

export function LoadMoreButton() {
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

  return createPortal(
    <Button className="w-full" size="lg">
      Load more
    </Button>,
    parent,
  );
}
