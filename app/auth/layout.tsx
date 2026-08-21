import { BrandLogo } from "~/components/layouts/header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col p-4 min-h-svh [--auth-layout-radius:0.5rem] [--auth-layout-gap:0.5rem] bg-linear-120 gap-(--auth-layout-gap)">
      <header className="flex items-center py-4 px-8 w-full corner-sharp rounded-(--auth-layout-radius) bg-muted/50">
        <BrandLogo />
      </header>

      <div className="flex flex-1 gap-(--auth-layout-gap)">
        <div className="flex flex-col gap-(--auth-layout-gap) basis-8/12">
          <section className="flex-1 relative p-8 rounded-(--auth-layout-radius) bg-muted corner-sharp flex *:min-w-xl items-center justify-center">
            {children}
          </section>

          <div className="rounded-(--auth-layout-radius) corner-sharp border-muted border font-mono text-xs p-4 text-muted-foreground">
            <p>Real people making great work.</p>
            <p>Home to african's next billion creators</p>
          </div>
        </div>

        <div className="flex-1 rounded-(--auth-layout-radius) corner-sharp basis-4/12 bg-muted"></div>
      </div>
    </div>
  );
}
