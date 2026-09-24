import Link from "next/link";
import { isLoggedIn } from "@/lib/mode";
import { DEMO_USERNAME } from "@/lib/auth";

export default async function SiteHeader() {
  const loggedIn = await isLoggedIn();
  const link =
    "rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50";

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <nav className="flex items-center gap-1">
          <Link href="/jobs" className="mr-3 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            JobFinder
          </Link>
          <Link href="/jobs" className={link}>
            Jobs
          </Link>
          <Link href="/exploits" className={link}>
            Exploits
          </Link>
        </nav>
        {loggedIn ? (
          <form action="/api/logout" method="POST" className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Signed in as <span className="font-medium text-zinc-700 dark:text-zinc-200">{DEMO_USERNAME}</span>
            </span>
            <button type="submit" className={link}>
              Sign out
            </button>
          </form>
        ) : (
          <Link href="/login" className={link}>
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
