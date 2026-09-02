import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery, isAuthenticated } from "~/lib/auth-server";
import OnboardingForm from "./form";

export type OnboardingPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function OnboardingPage(props: OnboardingPageProps) {
  const { searchParams } = props;

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
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-2 text-3xl font-bold tracking-tight">
            Welcome to Reveer
          </h1>

          <p className="text-muted-foreground text-base">
            Let's set up your profile to get started.
          </p>
        </div>

        <div className="bg-muted mx-auto max-w-md rounded-2xl p-8 shadow-lg backdrop-blur-sm">
          <OnboardingForm redirectTo={params.redirect ?? "/dashboard"} />
        </div>
      </div>
    </div>
  );
}
