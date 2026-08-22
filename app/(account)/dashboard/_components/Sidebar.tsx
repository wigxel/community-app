"use client";

import { useQuery } from "convex/react";
import { Logout } from "iconsax-reactjs";
import { LogOut, type LucideProps, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  DirectNotificationIcon,
  Folder2,
  Home,
  SaveIcon,
  SettingsIcon,
  TeacherIcon,
  UserIcon,
} from "~/components/icons";
import { AuthUserAvatar } from "~/components/profile/auth-user-avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { api } from "~/convex/_generated/api";
import { authClient } from "~/lib/auth-client";
import { ProfileImpl } from "~/lib/factories/profile";
import { cn } from "~/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconHoc = (IconComponent: React.FC<any>) => {
  return (props: LucideProps) => (
    <IconComponent variant={"Twotone"} {...props} />
  );
};

const navigation = [
  {
    name: "Home",
    href: "/dashboard/home",
    icon: IconHoc(Home),
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: IconHoc(Folder2),
  },
  {
    name: "Saves",
    href: "/dashboard/favourites",
    icon: IconHoc(SaveIcon),
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: IconHoc(UserIcon),
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: IconHoc(DirectNotificationIcon),
  },
  {
    name: "Tutorials",
    href: "/dashboard/mentorship",
    icon: IconHoc(TeacherIcon),
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: IconHoc(SettingsIcon),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const profile = useQuery(api.profiles.getProfile);

  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  const displayName = ProfileImpl.displayName(
    profile,
    session?.user?.name ?? "",
  );
  const email = profile?.email ?? session?.user?.email ?? "—";

  const SidebarContent = (
    <div className="flex flex-col pt-10 justify-between h-full w-full">
      <nav className="flex-1 overflow-y-auto space-y-10">
        {navigation.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <NavItem item={item} isActive={active} />
            </Link>
          );
        })}
      </nav>

      <div className="pb-4 flex flex-col">
        <button
          type="button"
          className="appearance-none"
          onClick={handleSignOut}
        >
          <NavItem
            item={{
              name: "Logout",
              icon: () => <Logout size={24} />,
            }}
          />
        </button>

        <div className="ps-2 mt-2 flex justify-between text-xs text-muted-foreground/50">
          <span>All rights reserved.</span>
          <span>&copy; 2026.</span>
        </div>
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
      <aside className="self-stretch flex  w-full">{SidebarContent}</aside>
    </>
  );
}

type NavItemProps = {
  item: Pick<(typeof navigation)[0], "name" | "icon">;
  isActive?: boolean;
};

function NavItem(props: NavItemProps) {
  const { item, isActive } = props;

  return (
    <li
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-normal transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : "text-white/70 hover:bg-white/8 hover:text-white",
      )}
    >
      <item.icon
        size={"1.5rem"}
        className={cn("shrink-0", isActive ? "text-lime-500" : "")}
      />
      <span>{item.name}</span>
    </li>
  );
}
