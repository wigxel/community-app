"use client";

import { useMutation, useQuery } from "convex/react";
import { Heart } from "lucide-react";
import { useCallback, useOptimistic, useTransition } from "react";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";

interface FavouriteButtonProps {
  projectId: Id<"project">;
  /**
   * "overlay" — square icon-only button that sits in the card hover overlay
   *             alongside the Eye button. Matches Eye button's size/style.
   * "card"    — compact pill with heart + count; used inside the project modal.
   * "inline"  — wider pill with label; used in profile project cards.
   */
  variant?: "overlay" | "card" | "inline";
  className?: string;
}

export function FavouriteButton({
  projectId,
  variant = "card",
  className,
}: FavouriteButtonProps) {
  const data = useQuery(api.favourites.getProjectFavourite, { projectId });
  const toggleFavourite = useMutation(api.favourites.toggle);

  const isFavourited = data?.isFavourited ?? false;
  const count = data?.count ?? 0;

  const [optimisticFavourited, setOptimisticFavourited] = useOptimistic(
    isFavourited,
    (_prev, next: boolean) => next,
  );
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    count,
    (_prev, next: number) => next,
  );

  const [isPending, startTransition] = useTransition();

  const isUnauthenticated = data?.isFavourited === null;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isUnauthenticated) return;

      const nextState = !isFavourited;
      const nextCount = nextState ? count + 1 : Math.max(0, count - 1);

      startTransition(async () => {
        setOptimisticFavourited(nextState);
        setOptimisticCount(nextCount);
        await toggleFavourite({ projectId });
      });
    },
    [
      isUnauthenticated,
      isFavourited,
      count,
      toggleFavourite,
      projectId,
      setOptimisticFavourited,
      setOptimisticCount,
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
          "relative flex items-center justify-center w-11 h-11 rounded-full",
          "backdrop-blur-sm border",
          "transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer",
          optimisticFavourited
            ? "bg-rose-500/30 border-rose-400/50 text-rose-300"
            : "bg-white/15 hover:bg-rose-500/25 border-white/25 hover:border-rose-400/50 text-white hover:text-rose-300",
          isUnauthenticated && "opacity-50 cursor-default hover:scale-100",
          className,
        )}
      >
        <Heart
          size={20}
          className={cn(
            "transition-all duration-200",
            optimisticFavourited ? "fill-rose-400 text-rose-400 scale-110" : "",
          )}
        />
        {/* Count badge — floats top-right corner of the button */}
        {optimisticCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none tabular-nums">
            {optimisticCount}
          </span>
        )}
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
          "backdrop-blur-sm border transition-all duration-200 select-none cursor-pointer",
          optimisticFavourited
            ? "bg-rose-500/30 border-rose-400/50 text-rose-300"
            : "bg-black/40 border-white/10 text-white/60 hover:text-rose-300 hover:border-rose-400/40 hover:bg-rose-500/20",
          isUnauthenticated && "opacity-60 cursor-default",
          className,
        )}
      >
        <Heart
          size={13}
          className={cn(
            "transition-all duration-200",
            optimisticFavourited
              ? "fill-rose-400 text-rose-400 scale-110"
              : "group-hover/fav:fill-rose-400/30",
          )}
        />
        {optimisticCount > 0 && (
          <span className="text-xs font-semibold tabular-nums leading-none">
            {optimisticCount}
          </span>
        )}
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
        "border text-sm font-medium transition-all duration-200 select-none cursor-pointer",
        optimisticFavourited
          ? "bg-rose-500/15 border-rose-400/40 text-rose-300"
          : "bg-white/5 border-white/15 text-white/50 hover:text-rose-300 hover:border-rose-400/30 hover:bg-rose-500/10",
        isUnauthenticated && "opacity-50 cursor-default",
        className,
      )}
    >
      <Heart
        size={15}
        className={cn(
          "transition-all duration-200",
          optimisticFavourited ? "fill-rose-400 text-rose-400" : "",
        )}
      />
      <span className="tabular-nums">
        {optimisticFavourited ? "Favourited" : "Favourite"}
        {optimisticCount > 0 && ` · ${optimisticCount}`}
      </span>
    </button>
  );
}
