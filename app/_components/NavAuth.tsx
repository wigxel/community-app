"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export default function NavAuth() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  if (!session) {
    return (
      <>
        <Link href="/auth">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/auth?mode=sign-up">
          <Button>Sign Up</Button>
        </Link>
      </>
    );
  }

  const initial = session.user.name?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      aria-label="Go to dashboard"
    >
      <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold select-none">
        {initial}
      </div>
    </Link>
  );
}
