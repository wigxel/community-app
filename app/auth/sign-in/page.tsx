import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFallback } from "../auth-fallback";
import SignInHandler from "./handler";

export const metadata: Metadata = {
  title: "Sign In",
};

export type SignInPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};
export default function SignInPage(props: SignInPageProps) {
  const { searchParams } = props;

  return (
    <Suspense fallback={<AuthFallback />}>
      <SignInHandler searchParamsPromise={searchParams} />
    </Suspense>
  );
}
