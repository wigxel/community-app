import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import ForgotPasswordForm from "./form";

export default async function ForgotPasswordHandler() {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect("/dashboard");
  }

  return <ForgotPasswordForm />;
}
