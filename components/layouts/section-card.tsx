import { cn } from "~/lib/utils";

export function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        `bg-muted border-border-subtle rounded-2xl border p-4`,
        className,
      )}
    >
      {children}
    </div>
  );
}
