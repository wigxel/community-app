import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import SignUpForm from "./form";

export default async function SignUpHandler({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ redirect?: string }>;
}) {
  const params = await searchParamsPromise;

  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect(params.redirect ?? "/dashboard");
  }

  return <SignUpForm redirectTo={params.redirect ?? "/dashboard"} />;
}
