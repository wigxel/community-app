"use client";
import { TabItem, Tabs, TabsList } from "@hyperbridge/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FeatureFlag } from "~/components/feature-flags";
import type { Profile } from "~/types/models";

export type ProfileNavigationProps = { profile: Profile };

export function ProfileNavigation(props: ProfileNavigationProps) {
  const { profile } = props;

  const prefix = !profile?.username ? "" : `/profile/${profile?.username}`;
  const pathname = usePathname();

  const resolveValue = () => {
    const subpaths = pathname.split("/");
    const [, , , nestedPath] = subpaths;

    if (nestedPath) return nestedPath;

    return "projects";
  };

  return (
    <Tabs value={resolveValue()}>
      <TabsList className="flex gap-x-8">
        <TabItem value="projects" asChild>
          <Link className="text-2xl" href={prefix}>
            Projects
          </Link>
        </TabItem>

        <FeatureFlag flagKey="ENABLE_PUBLIC_WORKING_HISTORY">
          <TabItem value="work-history" asChild>
            <Link className="text-2xl" href={`${prefix}/work-history`}>
              Work history
            </Link>
          </TabItem>
        </FeatureFlag>

        <FeatureFlag flagKey="ENABLE_MENTORSHIP">
          <TabItem value="workshop" asChild>
            <Link
              className="text-2xl"
              href={`/workshops/?filter=username:${prefix}/`}
            >
              Workshops
            </Link>
          </TabItem>
        </FeatureFlag>
      </TabsList>
    </Tabs>
  );
}
