import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "~/lib/utils";

const chipVariants = cva(
  "inline-flex items-center rounded-full border px-4 py-2 text-sm transition-all",
  {
    variants: {
      variant: {
        default: "text-foreground",
        highlighted: "border-brand-primary text-foreground",
        muted: "bg-muted text-muted-foreground font-normal hover:bg-white/20",
        ghost:
          "bg-background/50 group-hover:text-muted-foreground font-normal text-transparent hover:bg-white/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  /** Text shown inside the chip. */
  label: string;
  /** Optional trailing slot — an icon or a button. */
  icon?: React.ReactNode;
}

function Chip(props: ChipProps) {
  const { label, icon, variant, className, ...restProps } = props;

  return (
    <span className={cn(chipVariants({ variant }), className)} {...restProps}>
      {label}
      {icon ? (
        <span className="ms-2 inline-flex items-center">{icon}</span>
      ) : null}
    </span>
  );
}

export { Chip, chipVariants };
