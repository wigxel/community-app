import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery, isAuthenticated } from "~/lib/auth-server";
import OnboardingForm from "./form";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const isAuth = await isAuthenticated();

  if (!isAuth) {
    redirect("/auth?redirect=/onboarding");
  }

  const profile = await fetchAuthQuery(api.profiles.getForCurrentUser);
  if (profile) {
    redirect(params.redirect ?? "/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome!
          </h1>
          <p className="text-white/60 text-lg">
            Let's set up your profile to get started.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
          <OnboardingForm redirectTo={params.redirect ?? "/dashboard"} />
        </div>
      </div>
    </div>
  );
}
