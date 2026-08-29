import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import SignUpForm from "./form";
export type SignUpHandlerProps = {
  searchParamsPromise: Promise<{ redirect?: string }>;
};
export default async function SignUpHandler(props: SignUpHandlerProps) {
  const { searchParamsPromise } = props;

  const params = await searchParamsPromise;

  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect(params.redirect ?? "/dashboard");
  }

  return <SignUpForm redirectTo={params.redirect ?? "/dashboard"} />;
}
