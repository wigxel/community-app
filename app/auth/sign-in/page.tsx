import { Suspense } from "react";
import { AuthFallback } from "../auth-fallback";
import SignInHandler from "./handler";

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <SignInHandler searchParamsPromise={searchParams} />
    </Suspense>
  );
}
