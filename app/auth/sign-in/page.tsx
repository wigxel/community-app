import { Suspense } from "react";
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

function AuthFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-2 w-16 rounded-full bg-white/10 animate-pulse" />
    </div>
  );
}
