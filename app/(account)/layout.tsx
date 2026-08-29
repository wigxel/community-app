import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery, isAuthenticated } from "~/lib/auth-server";

export const metadata: Metadata = {
  title: {
    default: "Account",
    template: "%s | Reveer",
  },
};
export type AccountLayoutProps = {
  children: React.ReactNode;
};
export default async function AccountLayout(props: AccountLayoutProps) {
  const { children } = props;

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/auth?redirect=/dashboard");
  }

  try {
    const profile = await fetchAuthQuery(api.profiles.getForCurrentUser);
    if (!profile) {
      redirect("/onboarding?redirect=/dashboard");
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    redirect("/onboarding?redirect=/dashboard");
  }

  return <>{children}</>;
}
