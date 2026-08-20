import { Suspense } from "react";
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

function AuthFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-2 w-16 rounded-full bg-white/10 animate-pulse" />
    </div>
  );
}
