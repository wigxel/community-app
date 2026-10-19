"use client";

// import { useFeatureFlagEnabled } from "@posthog/react";
// import { useMediaQuery } from "hooks-ts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ProjectCardContent,
  ProjectCardMedia,
  ProjectCardMetrics,
  ProjectCardOwner,
  ProjectCardRoot,
} from "~/components/molecules/project-card";
// import { FeatureFlags } from "~/lib/constants";
import type { BasicProject } from "~/types/models";

type LandingProjectCardProps = { project: BasicProject };

function LandingProjectCard(props: LandingProjectCardProps) {
  const { project } = props;
  const pathname = usePathname();

  // @todo: fix quick preview feature
  //   const canQuickPreview = useFeatureFlagEnabled(
  //     FeatureFlags.ENABLE_QUICK_PREVIEW,
  //   );
  // const isMobile = useMediaQuery(
  //   "(max-width: 600px) or (orientation: portrait)",
  // );
  const isQuickPreview = false; //  canQuickPreview && !isMobile;

  const handleNavigation = (
    event:
      | React.KeyboardEvent<HTMLAnchorElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (!isQuickPreview) return;

    event.preventDefault();
    event.stopPropagation();

    window.location.hash = `#preview:${project._id}`;
  };

  return (
    <Link
      href={
        isQuickPreview
          ? { pathname, hash: `#preview:${project._id}` }
          : `/projects/${project._id}`
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
