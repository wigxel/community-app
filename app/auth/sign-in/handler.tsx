import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import SignInForm from "./form";

export default async function SignInHandler({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ redirect?: string }>;
}) {
  const params = await searchParamsPromise;

  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect(params.redirect ?? "/dashboard");
  }

  return <SignInForm redirectTo={params.redirect ?? "/dashboard"} />;
}
