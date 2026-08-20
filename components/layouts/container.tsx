import { cn } from "~/lib/utils";

const levels = {
  max: "container",
  inner: "container lg:w-[80svw]",
};

export function Container({
  children,
  className,
  level,
  ...props
}: React.ComponentProps<"div"> & { level: keyof typeof levels }) {
  return (
    <div {...props} className={cn("px-4 mx-auto ", levels[level], className)}>
      {children}
    </div>
  );
}
