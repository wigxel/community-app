"use client";

import Link from "next/link";
import { AuthUserAvatar } from "~/components/profile/auth-user-avatar";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export default function NavAuth() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="[--avatar-size:2rem]">
      {isPending ? (
        <AuthUserAvatar mode="loading" className="size-(--avatar-size)" />
      ) : session ? (
        <Link
          href="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Go to dashboard"
        >
          <AuthUserAvatar className="size-(--avatar-size)" />
        </Link>
      ) : (
        <>
          <Link href="/auth/sign-up">
            <Button variant="secondary">Sign up</Button>
          </Link>
          <Link href="/auth/sign-in">
            <Button variant="default">Sign in</Button>
          </Link>
        </>
      )}
    </div>
  );
}
