import { Suspense } from "react";
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

function AuthFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-2 w-16 rounded-full bg-white/10 animate-pulse" />
    </div>
  );
}
