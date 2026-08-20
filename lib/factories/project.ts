import type { Project } from "~/types/models";
import { safeArray } from "../data.helpers";

export const ProjectImpl = {
  listMedia: (project: Project) => safeArray(project.media),

  links: (project: Project) => safeArray(project.link),

  timeline: (project: Project) => {
    const start = project.timeline?.start?.year;
    const end = project.timeline?.end?.year;

    if (!start) return null;
    if (project.ongoing) return `${start} – Present`;
    if (end && end !== start) return `${start} – ${end}`;
    return start;
  },
};
