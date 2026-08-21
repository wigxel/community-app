import { Suspense } from "react";
import { AuthFallback } from "../auth-fallback";
import SignUpHandler from "./handler";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <SignUpHandler searchParamsPromise={searchParams} />
    </Suspense>
  );
}
