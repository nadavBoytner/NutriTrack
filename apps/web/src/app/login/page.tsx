import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="mb-1 font-display text-3xl font-medium">NutriTrack</h1>
      <p className="mb-8 border-b border-line pb-8 text-ink-soft">התחברות ליומן התזונה שלך</p>

      <AuthForm action={loginAction} submitLabel="התחברות" />

      <p className="mt-6 text-sm text-ink-soft">
        עוד אין לך חשבון?{" "}
        <Link href="/signup" className="text-link underline underline-offset-2">
          להרשמה
        </Link>
      </p>
    </main>
  );
}
