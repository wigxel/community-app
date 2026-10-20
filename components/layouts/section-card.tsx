import { cn } from "~/lib/utils";

export type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionCard(props: SectionCardProps) {
  const { children, className } = props;

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
