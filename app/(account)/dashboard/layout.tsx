import { BrandLogo } from "~/components/layouts/header";
import { AuthUserAvatar } from "~/components/profile/auth-user-avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Sidebar } from "./_components/sidebar";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div
        id="dashboard-root"
        className="h-svh py-2 flex-col w-full flex gap-x-4 max-w-[99%] mx-auto bg-background"
      >
        <header className="shrink-0 col-span-2 py-2 justify-between basis-12 bg-background min-h-12 flex items-center px-4">
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
};

export default DashboardLayout;
