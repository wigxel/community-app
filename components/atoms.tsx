import { GlobeIcon } from "lucide-react";
import { Behance, Figma, Github } from "~/components/icons";

export function ProjectLinkIcon({
  tag,
  size = 14,
  className,
}: {
  tag: string;
  size?: number;
  className?: string;
}) {
  const Icon = getLinkIcon(tag);

  return <Icon size={size} className={className} />;
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
  };

  return iconMap[tag.toLowerCase()] || GlobeIcon;
};
