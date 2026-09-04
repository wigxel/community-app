import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import SignInForm from "./form";
export type SignInHandlerProps = {
  searchParamsPromise: Promise<{ redirect?: string }>;
};
export default async function SignInHandler(props: SignInHandlerProps) {
  const { searchParamsPromise } = props;

  const params = await searchParamsPromise;

  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect(params.redirect ?? "/dashboard");
  }

  return <SignInForm redirectTo={params.redirect ?? "/dashboard"} />;
}
