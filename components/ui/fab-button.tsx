import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "~/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  variant?: "contour" | "default";
  asChild?: boolean;
}

const FAButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "bg-brand-primary text-foreground hover:bg-brand-primary/90 inline-flex aspect-square items-center justify-center rounded-full p-2 shadow",
          className,
        )}
        ref={ref}
        style={{
          cornerShape: "squircle",
          boxShadow:
            variant === "contour"
              ? "0 0 0 0.5rem var(--background)"
              : undefined,
          ...props.style,
        }}
        {...props}
      />
    );
  },
);

FAButton.displayName = "FAButton";

function FABPlusIcon() {
  return (
    <span
      title="Plus Icon"
      className="text-background relative inline-flex items-center justify-center"
    >
      <span className="absolute block h-[1em] w-0.5 bg-current" />
      <span className="absolute block h-[1em] w-0.5 rotate-90 bg-current" />
    </span>
  );
}

export { FABPlusIcon, FAButton };
