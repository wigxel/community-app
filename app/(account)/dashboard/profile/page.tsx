import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery } from "~/lib/auth-server";

export default async function DashboardProfilePage() {
  const profile = await fetchAuthQuery(api.profiles.getProfile, {});

  if (!profile) {
    redirect("/onboarding");
  }

  redirect(`/profile/${profile.username}`);
}
