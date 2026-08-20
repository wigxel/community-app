import { cn } from "~/lib/utils";

export function StandardGrid({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "grid [--s-grid-value:repeat(auto-fit,minmax(18rem,1fr))] gap-[1.2rem]",
        className,
      )}
      style={{
        ...props.style,
        gridTemplateColumns: "var(--s-grid-value)",
      }}
    >
      {children}
    </div>
  );
}
