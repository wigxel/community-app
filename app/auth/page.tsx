import { redirect } from "next/navigation";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const url = params.redirect
    ? `/auth/sign-in?redirect=${encodeURIComponent(params.redirect)}`
    : "/auth/sign-in";
  redirect(url);
}
