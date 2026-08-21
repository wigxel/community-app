import { ExternalLink, Figma, Github } from "~/components/icons";
import type { Project } from "~/types/models";
import { safeArray } from "../data.helpers";

const LINK_META: Record<string, { label: string; Icon: React.ElementType }> = {
  live: { label: "Live Site", Icon: ExternalLink },
  github: { label: "GitHub", Icon: Github },
  figma: { label: "Figma", Icon: Figma },
};

function getLinkMeta(tag: string) {
  return LINK_META[tag] ?? { label: tag, Icon: ExternalLink };
}

type MaybeProject = Project | null | undefined;

export const ProjectImpl = {
  listMedia: (project: MaybeProject) => safeArray(project?.media),

  links: (project: MaybeProject) => {
    return safeArray(project?.link).map((bare_link) => {
      return { ...bare_link, ...getLinkMeta(bare_link.tag) };
    });
  },

  timeline: (project: MaybeProject) => {
    const start = project?.timeline?.start?.year;
    const end = project?.timeline?.end?.year;

    if (!start) return null;
    if (project.ongoing) return `${start} – Present`;
    if (end && end !== start) return `${start} – ${end}`;

    return start ?? "--";
  },
};
