import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { NavLink } from "@/components/NavLink";
import { requireToken } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireToken();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 px-4 pt-4 lg:px-8">
        <div className="glass-panel mx-auto flex max-w-xl items-center justify-between px-5 py-3.5 lg:max-w-4xl">
          <Link href="/" className="gradient-text font-display text-xl font-bold tracking-tight">
            NutriTrack
          </Link>
          <nav aria-label="ניווט ראשי" className="flex items-center gap-6 text-sm">
            <NavLink href="/">יומן</NavLink>
            <NavLink href="/reports">דוחות</NavLink>
            <NavLink href="/profile">פרופיל</NavLink>
            <form action={logoutAction}>
              <button
                type="submit"
                className="border-b-2 border-transparent pb-0.5 text-ink-soft transition-colors duration-200 hover:text-warn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
              >
                יציאה
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 py-8 lg:max-w-4xl lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
