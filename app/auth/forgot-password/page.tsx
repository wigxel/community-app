import { Suspense } from "react";
import { AuthFallback } from "../auth-fallback";
import ForgotPasswordHandler from "./handler";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <ForgotPasswordHandler />
    </Suspense>
  );
}
