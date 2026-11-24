import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFallback } from "../auth-fallback";
import SignUpHandler from "./handler";

export const metadata: Metadata = {
  title: "Sign Up",
};

export type SignUpPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};
export default function SignUpPage(props: SignUpPageProps) {
  const { searchParams } = props;

  return (
    <Suspense fallback={<AuthFallback />}>
      <SignUpHandler searchParamsPromise={searchParams} />
    </Suspense>
  );
}
