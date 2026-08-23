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
          "bg-brand-primary text-foreground shadow hover:bg-brand-primary/90 inline-flex items-center justify-center p-2 aspect-square rounded-full",
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
      className="relative inline-flex justify-center items-center text-background"
    >
      <span className="block h-[1em] w-0.5 bg-current absolute" />
      <span className="block h-[1em] w-0.5 bg-current absolute rotate-90" />
    </span>
  );
}

export { FABPlusIcon, FAButton };
