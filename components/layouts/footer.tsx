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
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Use
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </nav>
      </Container>

      <Container level={"max"} className="mt-8 overflow-hidden max-h-[8svh]">
        <div className="relative text-muted-foreground text-center">
          <Image
            src={"/brand-logo-light.svg"}
            alt={"Community app"}
            className="w-full opacity-40"
            width={69}
            height={12}
          />
          <span className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
        </div>
      </Container>
    </footer>
  );
}
