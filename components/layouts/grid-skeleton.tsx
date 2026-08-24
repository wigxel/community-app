import { range } from "effect/Array";
import React from "react";
import { cn } from "~/lib/utils";
import { StandardGrid } from "./grids";

export function StandardGridSkeleton({
  size = 12,
  variant,
  className,
  Component,
}: {
  size?: number;
  variant?: "base" | "muted";
  className?: string;
  Component: React.ComponentType;
}) {
  const SKELETON_KEYS = React.useMemo(() => range(1, size), [size]);

  return (
    <StandardGrid
      className={cn("pointer-events-none relative", className)}
      style={{
        "--in-skeleton-bg":
          variant === "base" ? "var(--background)" : "var(--muted)",
      }}
    >
      {SKELETON_KEYS.map((k) => (
        <Component key={k} />
      ))}
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-(--in-skeleton-bg)" />
    </StandardGrid>
  );
}
