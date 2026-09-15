import { GlobeIcon } from "lucide-react";
import { Behance, Figma, Github } from "~/components/icons";

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
