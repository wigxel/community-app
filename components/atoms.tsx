import { GlobeIcon } from "lucide-react";
import { Behance, Figma, Github, LinkedIn } from "~/components/icons";

export type ProjectLinkIconProps = {
  tag: string;
  size?: number;
  className?: string;
};

export function ProjectLinkIcon(props: ProjectLinkIconProps) {
  const { tag, size = 14, className } = props;

  const Icon = getLinkIcon(tag);

  return <Icon size={size} className={className} />;
}

/**
 * Renders the affordability band as a 4-slot rating: filled ₦ for the active
 * level, muted placeholders for the rest ("₦₦" → 1,1,0,0).
 */
export function RateBandDisplay(props: {
  band: string | null | undefined;
  className?: string;
}) {
  const { band, className } = props;
  const filled = band?.length ?? 0;

  return (
    <span
      role="img"
      aria-label={`Rate band ${band ?? "not set"}`}
      className={`inline-flex gap-0.5 tabular-nums ${className ?? ""}`}
    >
      {Array.from({ length: 4 }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: four static slots, never reordered
        <span key={index} className={index < filled ? undefined : "opacity-20"}>
          ₦
        </span>
      ))}
    </span>
  );
}

export const getLinkIcon = (tag: string) => {
  type IconMap = Record<
    string,
    React.ComponentType<{ size?: number; className?: string }>
  >;

  const iconMap: IconMap = {
    github: Github,
    figma: Figma,
    behance: Behance,
    linkedin: LinkedIn,
  };

  return iconMap[tag.toLowerCase()] || GlobeIcon;
};
