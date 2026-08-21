import { Suspense } from "react";
import { AuthFallback } from "../auth-fallback";
import ResetPasswordHandler from "./handler";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <ResetPasswordHandler searchParamsPromise={searchParams} />
    </Suspense>
  );
}
