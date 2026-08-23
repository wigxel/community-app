"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavAuth from "~/app/_components/NavAuth";
import { cn } from "~/lib/utils";
import { Container } from "./container";

function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "transition-colors",
        isActive
          ? "text-foreground font-medium"
          : "text-foreground/60 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

export function Header() {
  return (
    <header className="slice-backdrop-effect sticky top-0 z-40 h-18 py-4">
      <Container
        level="max"
        className="flex items-center justify-between gap-2"
      >
        <BrandLogo />

        <nav className="inline-flex flex-1 justify-center gap-4">
          <NavItem href="/talents">Talents</NavItem>
          <NavItem href="/jobs">Jobs</NavItem>
          <NavItem href="/mentors">Mentors</NavItem>
        </nav>

        <div className="inline-flex flex-1 items-center justify-end gap-2">
          <NavAuth />
        </div>
      </Container>
    </header>
  );
}

export function BrandLogo() {
  return (
    <Link href="/" className="flex-1">
      <Image
        src="/brand-logo-light.svg"
        alt={"Rever"}
        width={69}
        height={12}
        className="translate-y-[25%] transform"
      />
    </Link>
  );
}
