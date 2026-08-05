import { Suspense } from "react";
import ForgotPasswordHandler from "./handler";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <ForgotPasswordHandler />
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
