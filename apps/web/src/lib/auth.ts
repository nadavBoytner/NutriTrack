import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "nutritrack_token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function requireToken(): Promise<string> {
  const token = await getToken();
  if (!token) {
    redirect("/login");
  }
  return token;
}

export async function setToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearToken(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
