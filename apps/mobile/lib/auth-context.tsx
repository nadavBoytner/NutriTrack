import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { tokenStore } from "@/lib/token-store";

const TOKEN_KEY = "nutritrack_token";

interface AuthContextValue {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tokenStore.getItem(TOKEN_KEY).then((stored) => {
      setToken(stored);
      setIsLoading(false);
    });
  }, []);

  async function signIn(newToken: string) {
    await tokenStore.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }

  async function signOut() {
    await tokenStore.deleteItem(TOKEN_KEY);
    setToken(null);
  }

  return <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
