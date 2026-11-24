import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs",
};

export type JobsLayoutProps = {
  children: React.ReactNode;
};

export default function JobsLayout(props: JobsLayoutProps) {
  const { children } = props;

  return children;
}
