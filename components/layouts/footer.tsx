import Image from "next/image";
import Link from "next/link";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t border-white/10 pt-8">
      <Container
        level="max"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-white/40">
          &copy; {new Date().getFullYear()} Community App. All rights reserved.
        </p>

        <nav className="flex gap-6 text-sm text-white/40">
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms of Use
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy Policy
          </Link>
        </nav>
      </Container>

      <Container level={"max"} className="mt-8 max-h-[8svh] overflow-hidden">
        <div className="text-muted-foreground relative text-center">
          <Image
            src={"/brand-logo-light.svg"}
            alt={"Community app"}
            className="w-full opacity-40"
            width={69}
            height={12}
          />
          <span className="from-background absolute inset-0 bg-linear-to-t to-transparent" />
        </div>
      </Container>
    </footer>
  );
}
