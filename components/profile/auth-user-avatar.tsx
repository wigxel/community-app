"use client";

import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { authClient } from "~/lib/auth-client";
import { ProfileImpl } from "~/lib/factories/profile";
import { cn } from "~/lib/utils";
import { ProfileAvatar } from "./avatar";
export type AuthUserAvatarProps = {
  mode?: "loading" | "loaded";
  className?: string;
};
export function AuthUserAvatar(props: AuthUserAvatarProps) {
  const { mode = "loaded", className } = props;

  const profile = useQuery(api.profiles.getProfile);

  const { isPending } = authClient.useSession();

  if (isPending || mode === "loading") {
    return (
      <div
        role="status"
        className={cn("bg-foreground/20 rounded-full", className)}
      />
    );
  }

  return (
    <ProfileAvatar
      name={ProfileImpl.displayName(profile)}
      src={profile?.profileImage ?? undefined}
      className={className}
    />
  );
}
