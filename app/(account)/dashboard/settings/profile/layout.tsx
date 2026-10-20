import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile",
};

export default function SettingsProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
