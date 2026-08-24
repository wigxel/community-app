import { redirect } from "next/navigation";
export type AuthPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};
export default async function AuthPage(props: AuthPageProps) {
  const { searchParams } = props;

  const params = await searchParams;
  const url = params.redirect
    ? `/auth/sign-in?redirect=${encodeURIComponent(params.redirect)}`
    : "/auth/sign-in";
  redirect(url);
}
