import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import ResetPasswordForm from "./form";

export default async function ResetPasswordHandler({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ token?: string }>;
}) {
  const params = await searchParamsPromise;
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect("/dashboard");
  }

  if (!params.token) {
    redirect("/auth/forgot-password");
  }

  return <ResetPasswordForm token={params.token} />;
}
