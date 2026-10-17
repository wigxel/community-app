"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { AuthUserAvatar } from "~/components/profile/auth-user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { authClient } from "~/lib/auth-client";

type AuthUserMenuProps = {
  className?: string;
};

export function AuthUserMenu({ className }: AuthUserMenuProps) {
  const router = useRouter();

  async function handleSignOut() {
    const { error } = await authClient.signOut();

    if (error) {
      return;
    }

    if (
      process.env.NEXT_PUBLIC_POSTHOG_KEY &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST
    ) {
      posthog.reset();
    }

    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-visible:ring-ring flex items-center gap-2 rounded-full transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label="Open account menu"
        >
          <AuthUserAvatar className={className} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <UserRound />
            <span>Account</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/profile">
            <Settings />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => {
            void handleSignOut();
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
