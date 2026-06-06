import Link from "next/link";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { api } from "~/convex/_generated/api";

export default async function NavAuth() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return (
      <>
        <Link
          href="/auth"
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth?mode=sign-up"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium text-sm h-10 px-5 inline-flex items-center transition-colors"
        >
          Sign Up
        </Link>
      </>
    );
  }

  const user = await fetchAuthQuery(api.auth.getCurrentUser).catch(() => null);
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      aria-label="Go to dashboard"
    >
      <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold select-none">
        {initial}
      </div>
    </Link>
  );
}
