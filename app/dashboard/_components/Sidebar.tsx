"use client";

import { useQuery } from "convex/react";
import { Home, LogOut, Menu, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { api } from "~/convex/_generated/api";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const profile = useQuery(api.profiles.getProfile);
  const { data: session } = authClient.useSession();

  const profileHref = profile?.username
    ? `/profile/${profile.username}`
    : "/dashboard/settings/profile";

  const navigation = [
    { name: "Home", href: "/dashboard/home", icon: Home },
    { name: "Profile", href: profileHref, icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : (session?.user?.name ?? "—");
  const email = profile?.email ?? session?.user?.email ?? "—";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile?.profileImage ?? session?.user?.image ?? undefined;

  const SidebarContent = (
    <div className="flex h-full flex-col border-r border-white/10">
      <div className="flex h-16 items-center px-5 border-b border-white/10 shrink-0">
        <span className="text-lg font-semibold tracking-wide">Dashboard</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navigation.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-500/15 text-blue-300"
                  : "text-white/70 hover:bg-white/8 hover:text-white",
              )}
            >
              <item.icon size={16} className="shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/10" />

      <div className="flex items-center gap-3 px-4 py-4 shrink-0">
        <Avatar className="size-8 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
          <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-white/50 truncate">{email}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="shrink-0 size-8 text-white/40 hover:text-white hover:bg-white/10"
          title="Sign out"
        >
          <LogOut size={15} />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 rounded-xl bg-slate-900/80 border border-white/10"
      >
        <Menu size={18} />
      </Button>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-50 text-white/50 hover:text-white"
        >
          <X size={18} />
        </Button>
        {SidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        {SidebarContent}
      </aside>
    </>
  );
}
