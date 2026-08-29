import { cn } from "~/lib/utils";
export function StandardGrid(props: React.ComponentProps<"div">) {
  const { children, className, style, ...restProps } = props;

  return (
    <div
      {...restProps}
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
