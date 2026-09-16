"use client";

import { useEffect } from "react";
import { Button } from "@/components/Button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="glass-panel p-6 text-center">
      <h1 className="mb-2 font-display text-lg font-bold tracking-tight">משהו השתבש</h1>
      <p className="mb-5 text-sm text-ink-soft">
        {error.message || "אירעה שגיאה בלתי צפויה. נסו לרענן או לנסות שוב."}
      </p>
      <Button onClick={reset}>נסה שוב</Button>
    </div>
  );
}
