import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFallback } from "../auth-fallback";
import ForgotPasswordHandler from "./handler";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <ForgotPasswordHandler />
    </Suspense>
  );
}
