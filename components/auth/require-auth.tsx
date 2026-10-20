"use client";
import dynamic from "next/dynamic";
import React from "react";
import { LoaderSimple } from "~/components/layouts/loader";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { useAuthProfile } from "~/hooks/use-auth";

// ponytail: capture-phase span instead of Radix Slot — Slot merges props the
// child must forward, and FavouriteButton doesn't. Ancestor capture always runs
// first with zero child cooperation; upgrade to Slot if children forward props.
export type RequireAuthProps = { children: React.ReactElement };

export function RequireAuth(props: RequireAuthProps) {
  const { children } = props;

  const profile = useAuthProfile();
  const [open, setOpen] = React.useState(false);

  function intercept(e: React.SyntheticEvent) {
    if (profile) return;
    e.preventDefault();
    e.stopPropagation();
    if (profile === null) setOpen(true);
  }

  return (
    <>
      <span className="contents" onClickCapture={intercept}>
        {children}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        {open ? (
          <LazyRequireAuthDialog onSignedIn={() => setOpen(false)} />
        ) : null}
      </Dialog>
    </>
  );
}

const LazyRequireAuthDialog = dynamic(() => import("./require-auth-dialog"), {
  ssr: false,
  loading: () => (
    <DialogContent>
      <div className="flex items-center justify-center py-8">
        <LoaderSimple />
      </div>
    </DialogContent>
  ),
});
