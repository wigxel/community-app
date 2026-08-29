import { Suspense } from "react";
import { AuthFallback } from "../auth-fallback";
import ResetPasswordHandler from "./handler";
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
