import { BrandLogo } from "~/components/layouts/header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col gap-(--auth-layout-gap) bg-linear-120 p-4 [--auth-layout-gap:0.5rem] [--auth-layout-radius:0.5rem]">
      <header className="corner-sharp bg-muted/50 flex w-full items-center rounded-(--auth-layout-radius) px-8 py-4">
        <BrandLogo />
      </header>

      <div className="flex flex-1 gap-(--auth-layout-gap)">
        <div className="flex basis-8/12 flex-col gap-(--auth-layout-gap)">
          <section className="bg-muted corner-sharp relative flex flex-1 items-center justify-center rounded-(--auth-layout-radius) p-8 *:min-w-xl">
            {children}
          </section>

          <div className="corner-sharp border-muted text-muted-foreground rounded-(--auth-layout-radius) border p-4 font-mono text-xs">
            <p>Real people making great work.</p>
            <p>Home to african's next billion creators</p>
          </div>
        </div>

        <div className="corner-sharp bg-muted flex-1 basis-4/12 rounded-(--auth-layout-radius)"></div>
      </div>
    </div>
  );
}
