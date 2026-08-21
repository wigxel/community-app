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
        "grid [--s-grid-value:repeat(auto-fill,minmax(18rem,1fr))] gap-[1.2rem]",
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
