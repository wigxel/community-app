import { GettingStartedWidget } from "~/components/dashboard/getting-started-widget";
import { DBHeaderPortal } from "~/components/layouts/dashboard-page-header";
import { BrandLogo } from "~/components/layouts/header";
import { AuthUserAvatar } from "~/components/profile/auth-user-avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Sidebar } from "./_components/sidebar";

type DashboardLayoutProps = { children: React.ReactNode };
async function DashboardLayout(props: DashboardLayoutProps) {
  const { children } = props;

  return (
    <>
      <div
        id="dashboard-root"
        className="bg-background mx-auto flex h-svh w-full max-w-[99%] flex-col gap-x-4 py-2 [--sidebar-width:0.24fr]"
      >
        <header className="bg-background col-span-1 flex min-h-12 shrink-0 basis-12 items-center justify-between px-4 py-2">
          <div className="pl-4">
            <BrandLogo />
          </div>
        </header>

        <nav className="flex min-h-12 items-center justify-between gap-12">
          <div className="min-h-12 flex-1">
            <DBHeaderPortal />
          </div>
          <AuthUserAvatar className="size-8" />
        </nav>

        <div className="flex flex-1 basis-2/12 ps-4">
          <Sidebar />
        </div>

        <ScrollArea className="bg-muted rounded-xl">
          <div data-scroll-section className="px-6 py-4">
            {children}
          </div>
        </ScrollArea>
      </div>

      <GettingStartedWidget />

      <style>
        {`
          #dashboard-root {
            display: grid;
            grid-template-columns: var(--sidebar-width) 1fr;
            grid-template-rows: clamp(44px, 14svh, 56px) 1fr;
          }
        `}
      </style>
    </>
  );
}

export default DashboardLayout;
