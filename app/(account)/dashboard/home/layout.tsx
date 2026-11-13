import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export type HomeLayoutProps = {
  children: React.ReactNode;
};

export default function HomeLayout(props: HomeLayoutProps) {
  const { children } = props;

  return children;
}
