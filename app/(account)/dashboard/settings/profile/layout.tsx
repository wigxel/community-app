import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile",
};

export type SettingsProfileLayoutProps = {
  children: React.ReactNode;
};

export default function SettingsProfileLayout(
  props: SettingsProfileLayoutProps,
) {
  const { children } = props;

  return children;
}
