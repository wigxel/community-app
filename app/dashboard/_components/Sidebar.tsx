// "use client";

// import { UserButton } from "@clerk/nextjs";
// import { useQuery } from "convex/react";
// import { Home, Menu, Settings, User, X } from "lucide-react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState } from "react";
// import { Button } from "~/components/ui/button";
// import { api } from "~/convex/_generated/api";
// import { cn } from "~/lib/utils";

// const navigation = [
//   {
//     name: "Home",
//     href: "/dashboard/home",
//     icon: Home,
//   },
//   {
//     name: "Profile",
//     href: "/dashboard/profile",
//     icon: User,
//   },
//   {
//     name: "Settings",
//     href: "/dashboard/settings",
//     icon: Settings,
//   },
// ];

// const classNames = (...classes: (string | false | undefined)[]) =>
//   classes.filter(Boolean).join(" ");

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);
//   const profile = useQuery(api.profiles.getProfile);

//   const SidebarContent = (
//     <div className="flex-1 flex h-full flex-col border-r border-white/10">
//       <div className="h-18 flex items-center px-5 border-b border-white/10">
//         <span className="text-xl font-bold tracking-wide">Dashboard</span>
//       </div>

//       <nav className="flex-1 p-4 space-y-2">
//         {navigation.map((item) => {
//           const active = pathname.startsWith(item.href);

//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={cn(
//                 "w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition",
//                 active
//                   ? "bg-blue-500/20 text-blue-300"
//                   : "hover:bg-white/10 text-white/80",
//               )}
//             >
//               <item.icon size={18} />
//               {item.name}
//             </Link>
//           );
//         })}
//       </nav>

//       <div className="px-4 min-h-16 flex items-center gap-4 py-4">
//         <UserButton />

//         <div className="flex flex-col">
//           <span>
//             {profile?.firstName} {profile?.lastName ?? "--"}
//           </span>
//           <span className="text-sm">{profile?.title ?? "--"}</span>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* Mobile toggle */}
//       <Button
//         onClick={() => setOpen(true)}
//         className="lg:hidden fixed top-4 left-4 z-50 rounded-xl bg-slate-900/80 p-2 border border-white/10"
//       >
//         <Menu />
//       </Button>

//       {/* Mobile overlay */}
//       {open && (
//         <div
//           className="fixed inset-0 bg-black/60 z-40 lg:hidden"
//           onClick={() => setOpen(false)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" || e.key === "Escape") {
//               setOpen(false);
//             }
//           }}
//           role="dialog"
//           tabIndex={-1}
//         />
//       )}

//       {/* Mobile sidebar */}
//       <div
//         className={classNames(
//           "fixed inset-y-0 left-0 z-50 w-64 transition-transform lg:hidden",
//           open ? "translate-x-0" : "-translate-x-full",
//         )}
//       >
//         <Button
//           onClick={() => setOpen(false)}
//           className="absolute top-4 right-4 z-50"
//         >
//           <X />
//         </Button>
//         {SidebarContent}
//       </div>

//       {/* Desktop sidebar */}
//       <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
//         {SidebarContent}
//       </aside>
//     </>
//   );
// }

"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Home, Menu, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import { cn } from "~/lib/utils";

const navigation = [
  {
    name: "Home",
    href: "/dashboard/home",
    icon: Home,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const classNames = (...classes: (string | false | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isLoaded, isSignedIn } = useUser();

  const profile = useQuery(
    api.profiles.getProfile,
    isLoaded && isSignedIn ? {} : "skip",
  );

  const SidebarContent = (
    <div className="flex-1 flex h-full flex-col border-r border-white/10">
      <div className="h-18 flex items-center px-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-wide">Dashboard</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition",
                active
                  ? "bg-blue-500/20 text-blue-300"
                  : "hover:bg-white/10 text-white/80",
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 min-h-16 flex items-center gap-4 py-4">
        <UserButton />

        <div className="flex flex-col">
          <span>
            {profile?.firstName ?? "--"} {profile?.lastName ?? ""}
          </span>
          <span className="text-sm">{profile?.title?.name ?? "--"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 rounded-xl bg-slate-900/80 p-2 border border-white/10"
      >
        <Menu />
      </Button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              setOpen(false);
            }
          }}
          role="dialog"
          tabIndex={-1}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={classNames(
          "fixed inset-y-0 left-0 z-50 w-64 transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-50"
        >
          <X />
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
