import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { requireToken } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireToken();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-xl font-medium">
            NutriTrack
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/" className="text-ink-soft hover:text-ink">
              יומן
            </Link>
            <Link href="/reports" className="text-ink-soft hover:text-ink">
              דוחות
            </Link>
            <Link href="/profile" className="text-ink-soft hover:text-ink">
              פרופיל
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-ink-soft hover:text-warn">
                יציאה
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-xl px-4 py-8">{children}</div>
    </div>
  );
}
