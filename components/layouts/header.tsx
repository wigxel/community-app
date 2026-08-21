import Image from "next/image";
import Link from "next/link";
import NavAuth from "~/app/_components/NavAuth";
import { Container } from "./container";

export function Header() {
  return (
    <header className="h-18 slice-backdrop-effect py-4 z-40 sticky top-0">
      <Container
        level="max"
        className="flex gap-2 justify-between items-center"
      >
        <BrandLogo />

        <nav className="inline-flex gap-4 flex-1 justify-center">
          <Link href="/catalog">Projects</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/mentors">Mentors</Link>
        </nav>

        <div className="inline-flex flex-1 justify-end gap-2 items-center">
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
        className="transform translate-y-[25%]"
      />
    </Link>
  );
}
