"use client";

import { useMutation, useQuery } from "convex/react";
import posthog from "posthog-js";
import { useCallback, useOptimistic, useTransition } from "react";
import { SaveIcon } from "~/components/icons";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";

interface SaveButtonProps {
  projectId: Id<"project">;
  /**
   * "overlay" — square icon-only button that sits in the card hover overlay
   *             alongside the Eye button. Matches Eye button's size/style.
   * "card"    — compact pill with SaveIcon; used inside the project modal.
   * "inline"  — wider pill with label; used in profile project cards.
   */
  variant?: "overlay" | "card" | "inline";
  className?: string;
}

export function SaveButton(props: SaveButtonProps) {
  const { projectId, variant = "card", className } = props;

  const data = useQuery(api.favourites.getProjectFavourite, { projectId });
  const toggleFavourite = useMutation(api.favourites.toggle);

  const isFavourited = data?.isFavourited ?? false;

  const [optimisticFavourited, setOptimisticFavourited] = useOptimistic(
    isFavourited,
    (_prev, next: boolean) => next,
  );

  const [isPending, startTransition] = useTransition();

  const isUnauthenticated = data?.isFavourited === null;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isUnauthenticated) return;

      const nextState = !isFavourited;

      startTransition(async () => {
        setOptimisticFavourited(nextState);
        await toggleFavourite({ projectId });
        if (
          process.env.NEXT_PUBLIC_POSTHOG_KEY &&
          process.env.NEXT_PUBLIC_POSTHOG_HOST
        ) {
          posthog.capture(
            nextState ? "project_favourited" : "project_unfavourited",
            { project_id: projectId },
          );
        }
      });
    },
    [
      isUnauthenticated,
      isFavourited,
      toggleFavourite,
      projectId,
      setOptimisticFavourited,
    ],
  );

  const ariaLabel = optimisticFavourited
    ? "Remove from favourites"
    : "Add to favourites";
  const title = isUnauthenticated ? "Sign in to favourite projects" : undefined;

  // ── Overlay variant — matches the Eye button exactly ─────────────────────
  if (variant === "overlay") {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={optimisticFavourited}
        disabled={isPending}
        onClick={handleClick}
        title={title}
        className={cn(
          "relative flex h-11 w-11 items-center justify-center rounded-full",
          "text-foreground backdrop-blur-sm",
          "cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95",
          isUnauthenticated && "cursor-default",
          className,
        )}
      >
        <SaveIcon
          size={20}
          className={cn(
            "transition-all duration-200",
            optimisticFavourited ? "scale-110 fill-current" : "",
          )}
        />
      </button>
    );
  }

  // ── Card variant — compact pill; used inside the project modal ────────────
  if (variant === "card") {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={optimisticFavourited}
        disabled={isPending}
        onClick={handleClick}
        title={title}
        className={cn(
          "group/fav flex items-center gap-1 rounded-full px-2.5 py-1",
          "cursor-pointer border backdrop-blur-sm transition-all duration-200 select-none",
          optimisticFavourited
            ? "border-cyan-400/50 bg-cyan-500/30 text-cyan-300"
            : "text-muted-foreground border-white/10 bg-black/40 hover:border-cyan-400/40 hover:bg-cyan-500/20 hover:text-cyan-300",
          isUnauthenticated && "cursor-default",
          className,
        )}
      >
        <SaveIcon
          size={13}
          className={cn(
            "transition-all duration-200",
            optimisticFavourited
              ? "scale-110 fill-cyan-400 text-cyan-400"
              : "group-hover/fav:fill-cyan-400/30",
          )}
        />
      </button>
    );
  }

  // ── Inline variant — wide pill with label; used in profile project cards ──
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={optimisticFavourited}
      disabled={isPending}
      onClick={handleClick}
      title={title}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5",
        "cursor-pointer border text-sm font-medium transition-all duration-200 select-none",
        optimisticFavourited
          ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
          : "border-white/15 bg-white/5 text-white/50 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-300",
        isUnauthenticated && "cursor-default",
        className,
      )}
    >
      <SaveIcon
        size={15}
        className={cn(
          "transition-all duration-200",
          optimisticFavourited ? "fill-cyan-400 text-cyan-400" : "",
        )}
      />
      <span>{optimisticFavourited ? "Favourited" : "Favourite"}</span>
    </button>
  );
}
