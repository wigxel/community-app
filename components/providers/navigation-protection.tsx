"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface UseUnsavedChangesGuardOptions {
  isDirty: boolean;
}

export function useUnsavedChangesGuard({
  isDirty,
}: UseUnsavedChangesGuardOptions) {
  const router = useRouter();

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [pendingUrl, setPendingUrl] = React.useState<string | null>(null);

  const allowNavigationRef = React.useRef(false);

  // Protect browser refresh / tab close
  React.useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Protect normal link navigation
  React.useEffect(() => {
    if (!isDirty) return;

    const handleClick = (event: MouseEvent) => {
      if (allowNavigationRef.current) {
        return;
      }

      if (event.defaultPrevented) {
        return;
      }

      if (event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a");

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      if (link.target && link.target !== "_self") {
        return;
      }

      if (link.hasAttribute("download")) {
        return;
      }

      const destination = new URL(link.href, window.location.href);

      if (destination.origin !== window.location.origin) {
        return;
      }

      const currentUrl = new URL(window.location.href);

      if (
        destination.pathname === currentUrl.pathname &&
        destination.search === currentUrl.search &&
        destination.hash === currentUrl.hash
      ) {
        return;
      }

      event.preventDefault();

      setPendingUrl(
        `${destination.pathname}${destination.search}${destination.hash}`,
      );
      setShowConfirmDialog(true);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty]);

  // Protect browser back/forward navigation
  React.useEffect(() => {
    if (!isDirty) return;

    window.history.pushState(
      { navigationGuard: true },
      "",
      window.location.href,
    );

    const handlePopState = () => {
      if (allowNavigationRef.current) {
        return;
      }

      window.history.forward();

      setPendingUrl(null);
      setShowConfirmDialog(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  function navigate(url: string) {
    if (!isDirty) {
      router.push(url);
      return;
    }

    setPendingUrl(url);
    setShowConfirmDialog(true);
  }

  function handleStay() {
    setShowConfirmDialog(false);
    setPendingUrl(null);
  }

  function handleLeave() {
    allowNavigationRef.current = true;
    setShowConfirmDialog(false);

    if (pendingUrl) {
      router.push(pendingUrl);
      setPendingUrl(null);
      return;
    }

    window.history.go(-2);
  }

  function ConfirmationDialog() {
    return (
      <Dialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          if (!open) {
            handleStay();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave this
              page? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleStay}>
              Stay
            </Button>

            <Button type="button" variant="destructive" onClick={handleLeave}>
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return {
    ConfirmationDialog,
    navigate,
  };
}
