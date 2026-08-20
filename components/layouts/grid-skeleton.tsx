import { range } from "effect/Array";
import React from "react";
import { StandardGrid } from "./grids";

export function StandardGridSkeleton({
  size = 12,
  Component,
}: {
  size?: number;
  Component: React.ComponentType;
}) {
  const SKELETON_KEYS = React.useMemo(() => range(1, size), [size]);

  return (
    <StandardGrid className="relative pointer-events-none">
      {SKELETON_KEYS.map((k) => (
        <Component key={k} />
      ))}
      <div className="bg-linear-to-b from-transparent to-background absolute inset-0" />
    </StandardGrid>
  );
}
