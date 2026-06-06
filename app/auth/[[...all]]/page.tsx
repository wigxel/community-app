import { Suspense } from "react";
import AuthHandler from "./handler";

export default function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; mode?: string }>;
}) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthHandler searchParamsPromise={searchParams} />
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
