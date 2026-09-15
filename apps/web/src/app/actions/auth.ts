"use server";

import { redirect } from "next/navigation";
import type { AuthResponse } from "@foodtrack/shared-types";
import { ApiError, apiFetch } from "@/lib/api";
import { clearToken, setToken } from "@/lib/auth";

export type AuthActionState = { error?: string } | null;

async function authenticate(path: "/auth/signup" | "/auth/login", formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const res = await apiFetch<AuthResponse>(path, { method: "POST", body: { email, password } });
    await setToken(res.accessToken);
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect("/");
}

export async function signupAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  return authenticate("/auth/signup", formData);
}

export async function loginAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  return authenticate("/auth/login", formData);
}

export async function logoutAction(): Promise<void> {
  await clearToken();
  redirect("/login");
}
