import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Account < Reveer",
    template: "%s | Account < Reveer",
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
