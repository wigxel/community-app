import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QueryProvider } from "~/components/providers/react-query";
import { isAuthenticated } from "~/lib/auth-server";

export const metadata: Metadata = {
  title: {
    default: "Account",
    template: "%s | Reveer",
  },
};

type AccountLayoutProps = {
  children: React.ReactNode;
};

export default async function AccountLayout(props: AccountLayoutProps) {
  const { children } = props;

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/auth?redirect=/dashboard");
  }

  return <QueryProvider>{children}</QueryProvider>;
}
