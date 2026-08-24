import { cn } from "~/lib/utils";

export function StandardGrid({
  children,
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "grid gap-[1.2rem] [--s-grid-value:repeat(auto-fill,minmax(18rem,1fr))]",
        className,
      )}
      style={{
        ...style,
        gridTemplateColumns: "var(--s-grid-value)",
      }}
    >
      {children}
    </div>
  );
}
