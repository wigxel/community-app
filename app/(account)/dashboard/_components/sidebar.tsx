"use client";

import { Logout } from "iconsax-reactjs";
import { type LucideProps, Menu, X } from "lucide-react";
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
} from "~/components/icons";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

const IconHoc = (IconComponent: React.FC<Record<PropertyKey, unknown>>) => {
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

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  const SidebarContent = (
    <div className="flex h-full w-full flex-col justify-between pt-10 select-none">
      <nav className="flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} draggable={false}>
              <NavItem item={item} isActive={active} />
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col pb-4">
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

        <div className="text-muted-foreground/50 mt-2 flex justify-between ps-2 text-xs">
          <span>All rights reserved</span>
          <span>&copy; 2026</span>
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
        className="fixed top-4 left-4 z-50 rounded-xl border border-white/10 bg-slate-900/80 lg:hidden"
      >
        <Menu size={18} />
      </Button>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
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
      <aside className="flex w-full self-stretch">{SidebarContent}</aside>
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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-normal transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : "text-foreground/50 hover:bg-muted hover:text-foreground",
      )}
    >
      <item.icon
        size={"1.5rem"}
        className={cn("shrink-0", isActive ? "text-brand-primary" : "")}
      />
      <span>{item.name}</span>
    </li>
  );
}
