import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export type LeaderboardLayoutProps = {
  children: React.ReactNode;
};

export default function LeaderboardLayout(props: LeaderboardLayoutProps) {
  const { children } = props;

  return children;
}
