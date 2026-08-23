import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const SegmentProgressBar = (props: {
  className?: string;
  progressValue?: number;
  gradient?: { startColor: string; endColor: string };
}) => {
  const {
    gradient = {
      startColor: "#ef4444",
      endColor: "#f97316",
    },
    progressValue = 0,
    className,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [totalSegments, setTotalSegments] = useState(0);

  useLayoutEffect(() => {
    const updateSegments = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Segment width (3px) + gap (4px, based on 'gap-1') = 7px per segment unit
        const segmentSpace = 7;
        const count = Math.floor(width / segmentSpace);
        setTotalSegments(count);
      }
    };

    updateSegments();
    window.addEventListener("resize", updateSegments);

    return () => window.removeEventListener("resize", updateSegments);
  }, []);

  // Compute active segments dynamically based on the percentage
  const activeSegments = Math.round(
    (Math.max(0, Math.min(100, progressValue)) / 100) * totalSegments,
  );

  const count = React.useMemo(() => {
    return Array.from({ length: totalSegments }).map((_, index) => ({ index }));
  }, [totalSegments]);

  return (
    <div ref={containerRef} className="flex h-6 w-full gap-1">
      {count.map(({ index }) => {
        const isActive = index < activeSegments;
        const progressPercent =
          activeSegments > 0 ? (index / activeSegments) * 100 : 0;

        let style = {};
        if (isActive) {
          style = {
            backgroundColor: `color-mix(in srgb, ${gradient.startColor} ${100 - progressPercent}%, ${gradient.endColor} ${progressPercent}%)`,
          };
        }

        return (
          <div
            key={index}
            data-active={isActive}
            className={cn(
              "group relative h-6 w-0.75 overflow-hidden rounded-sm",
              className,
              !isActive && "bg-background/40",
            )}
          >
            <span
              className={cn(
                "absolute inset-0 transition-all duration-500",
                !isActive && "top-[100%]",
              )}
              style={style}
            />
          </div>
        );
      })}
    </div>
  );
};
