"use client";

import { useMediaQuery } from "hooks-ts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ProjectCardContent,
  ProjectCardMedia,
  ProjectCardMetrics,
  ProjectCardOwner,
  ProjectCardRoot,
} from "~/components/molecules/project-card";
import type { BasicProject } from "~/types/models";

type LandingProjectCardProps = { project: BasicProject };

function LandingProjectCard(props: LandingProjectCardProps) {
  const { project } = props;

  const pathname = usePathname();
  const isMobile = useMediaQuery(
    "(max-width: 600px) or (orientation: portrait)",
  );

  const handleNavigation = (
    event:
      | React.KeyboardEvent<HTMLAnchorElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (isMobile) return;

    event.preventDefault();
    event.stopPropagation();

    window.location.hash = `#preview:${project._id}`;
  };

  return (
    <Link
      href={
        isMobile
          ? `/projects/${project._id}`
          : { pathname, hash: `#preview:${project._id}` }
      }
      scroll={false}
      onClick={handleNavigation}
      onKeyDown={handleNavigation}
    >
      <ProjectCardRoot project={project}>
        <ProjectCardMedia />
        <ProjectCardContent>
          <ProjectCardOwner />
          <ProjectCardMetrics />
        </ProjectCardContent>
      </ProjectCardRoot>
    </Link>
  );
}

export default LandingProjectCard;
