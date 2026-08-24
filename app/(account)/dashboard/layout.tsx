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
        className="bg-background mx-auto flex h-svh w-full max-w-[99%] flex-col gap-x-4 py-2"
      >
        <header className="bg-background col-span-2 flex min-h-12 shrink-0 basis-12 items-center justify-between px-4 py-2">
          <div className="pl-4">
            <BrandLogo />
          </div>

          <AuthUserAvatar className="size-8" />
        </header>

        <div className="flex flex-1 basis-2/12 ps-4">
          <Sidebar />
        </div>

        <ScrollArea className="bg-muted rounded-xl">
          <div data-scroll-section className="px-6 py-4">
            {children}
          </div>
        </ScrollArea>
      </div>

      <style>
        {`
          #dashboard-root {
            display: grid;
            grid-template-columns: 0.24fr 1fr;
            grid-template-rows: clamp(44px, 14svh, 56px) 1fr;
          }
        `}
      </style>
    </>
  );
}

export default DashboardLayout;
