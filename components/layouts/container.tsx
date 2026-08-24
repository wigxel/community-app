import { cn } from "~/lib/utils";

const levels = {
  max: "container",
  inner: "container lg:w-[80svw]",
};

export function Container({
  children,
  className,
  level = "max",
  ...props
}: React.ComponentProps<"div"> & { level?: keyof typeof levels }) {
  return (
    <div {...props} className={cn("mx-auto px-4", levels[level], className)}>
      {children}
    </div>
  );
}
