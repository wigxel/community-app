import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import AuthForm from "./form";

export default async function AuthHandler({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ redirect?: string; mode?: string }>;
}) {
  const params = await searchParamsPromise;

  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect(params.redirect ?? "/dashboard");
  }

  return (
    <AuthForm
      redirectTo={params.redirect ?? "/dashboard"}
      defaultMode={params.mode === "sign-up" ? "sign-up" : "sign-in"}
    />
  );
}
