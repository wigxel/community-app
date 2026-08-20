import Link from "next/link";
import NavAuth from "~/app/_components/NavAuth";
import { Container } from "./container";

export function Header() {
  return (
    <header className="h-18 py-4">
      <Container
        level="max"
        className="flex gap-2 justify-between items-center"
      >
        <Link href="/" className="flex-1">
          <span>Logo</span>
        </Link>

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
