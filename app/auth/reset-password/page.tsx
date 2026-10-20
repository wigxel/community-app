import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFallback } from "../auth-fallback";
import ResetPasswordHandler from "./handler";

export const metadata: Metadata = {
  title: "Reset Password",
};

export type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};
export default function ResetPasswordPage(props: ResetPasswordPageProps) {
  const { searchParams } = props;

  return (
    <Suspense fallback={<AuthFallback />}>
      <ResetPasswordHandler searchParamsPromise={searchParams} />
    </Suspense>
  );
}
