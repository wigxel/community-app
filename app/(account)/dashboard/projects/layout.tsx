import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
};

export type ProjectsLayoutProps = {
  children: React.ReactNode;
};

export default function ProjectsLayout(props: ProjectsLayoutProps) {
  const { children } = props;

  return children;
}
