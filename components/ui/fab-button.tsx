import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "~/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  asChild?: boolean;
}

const FAButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
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
