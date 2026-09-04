import { Suspense } from "react";
import { AuthFallback } from "../auth-fallback";
import SignInHandler from "./handler";
export type SignInPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};
export default function SignInPage(props: SignInPageProps) {
  const { searchParams } = props;

  return (
    <Suspense fallback={<AuthFallback />}>
      <SignInHandler searchParamsPromise={searchParams} />
    </Suspense>
  );
}
