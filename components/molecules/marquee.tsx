import { range } from "effect/Array";
import type { ReactNode } from "react";

// ponytail: width/speed are estimates because CSS can't measure its own
// content; give rendered items a fixed width if the drift ever shows.
const ITEM_GUESS_PX = 220;
const MIN_HALF_PX = 2048;
const PX_PER_SECOND = 50;

type MarqueeProps<T> = {
  items: readonly T[];
  /** Render one item. Set the element's own `key` here. */
  renderItem: (item: T, index: number) => ReactNode;
};

/**
 * Auto-scrolling, infinitely looping strip of `items`.
 * Pauses on hover, stops entirely for prefers-reduced-motion.
 * Duplicate copies are aria-hidden so screen readers only read each item once.
 */
export function Marquee<T>({ items, renderItem }: MarqueeProps<T>) {
  const count = Math.max(1, items.length);
  // Always even, so translateX(-50%) lands exactly on a copy → seamless loop.
  const copies =
    2 * Math.max(1, Math.ceil(MIN_HALF_PX / (count * ITEM_GUESS_PX)));

  const seconds = Math.max(
    20,
    ((copies / 2) * count * ITEM_GUESS_PX) / PX_PER_SECOND,
  );

  return (
    <div className="relative overflow-hidden">
      <div className="from-background absolute inset-y-0 start-0 z-20 h-full w-40 bg-linear-to-r to-transparent" />
      <div
        className="marquee-track"
        style={{ animationDuration: `${seconds}s` }}
      >
        {range(0, copies).map((copy) => {
          return (
            <div key={copy} aria-hidden={copy > 0} className="flex gap-4 pe-4">
              {items.map((item, index) => renderItem(item, index))}
            </div>
          );
        })}
      </div>
      <div className="to-background absolute inset-y-0 end-0 z-20 h-full w-40 bg-linear-to-r from-transparent" />
    </div>
  );
}
