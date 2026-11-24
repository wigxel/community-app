import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentors",
};

export type MentorsLayoutProps = {
  children: React.ReactNode;
};

export default function MentorsLayout(props: MentorsLayoutProps) {
  const { children } = props;

  return children;
}
