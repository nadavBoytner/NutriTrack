import type { Metadata } from "next";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "הרשמה" };

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="mb-1 font-display text-3xl font-medium">NutriTrack</h1>
      <p className="mb-8 border-b border-line pb-8 text-ink-soft">פתיחת יומן תזונה חדש</p>

      <AuthForm action={signupAction} submitLabel="הרשמה" />

      <p className="mt-6 text-sm text-ink-soft">
        כבר יש לך חשבון?{" "}
        <Link href="/login" className="text-link underline underline-offset-2">
          להתחברות
        </Link>
      </p>
    </main>
  );
}
