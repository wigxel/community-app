"use client";

import Link from "next/link";
import { ProfileAvatar } from "~/components/profile/avatar";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { safeStr } from "~/lib/data.helpers";

export default function NavAuth() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  if (!session) {
    return (
      <>
        <Link href="/auth/sign-up">
          <Button variant="secondary">Sign up</Button>
        </Link>
        <Link href="/auth/sign-in">
          <Button variant="default">Sign in</Button>
        </Link>
      </>
    );
  }

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      aria-label="Go to dashboard"
    >
      <ProfileAvatar name={safeStr(session.user.name, "Anonymous")} />
    </Link>
  );
}
