"use client";

import { Logout } from "iconsax-reactjs";
import { UserIcon } from "lucide-react";
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
import { SettingsIcon } from "../icons";

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
            <UserIcon className="text-muted-foreground" />
            <span className="text-base">Account</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/profile">
            <SettingsIcon className="text-muted-foreground" />
            <span className="text-base">Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="mx-2" />

        <DropdownMenuItem
          onSelect={() => {
            void handleSignOut();
          }}
          className="hover:text-destructive focus:text-destructive"
        >
          <Logout className="text-muted-foreground" />
          <span className="text-base">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
