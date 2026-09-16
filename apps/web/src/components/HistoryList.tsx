"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { DayHistory } from "@foodtrack/shared-types";
import { getHistoryAction } from "@/app/actions/log";
import { Button } from "@/components/Button";
import { formatHebrewDate } from "@/lib/dates";

export function HistoryList({ initial }: { initial: { days: DayHistory[]; nextCursor: string | null } }) {
  const [days, setDays] = useState(initial.days);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    setError(null);
    startTransition(async () => {
      try {
        const page = await getHistoryAction(cursor ?? undefined);
        setDays((prev) => [...prev, ...page.days]);
        setCursor(page.nextCursor);
      } catch {
        setError("טעינת ההיסטוריה נכשלה, נסו שוב");
      }
    });
  }

  if (days.length === 0) {
    return <p className="text-sm text-ink-soft">עדיין אין היסטוריה להצגה.</p>;
  }

  return (
    <div>
      {days.map((day) => (
        <Link
          key={day.date}
          href={`/?date=${day.date}`}
          className="flex items-center justify-between gap-4 border-b border-line py-3.5 transition-colors duration-200 last:border-b-0 hover:bg-white/5"
        >
          <div>
            <p className="font-display text-[15px] font-bold tracking-tight text-ink">{formatHebrewDate(day.date)}</p>
            <p className="mt-1 text-xs tabular-nums text-ink-soft">
              {Math.round(day.totals.calories)} קל&apos; · {Math.round(day.totals.carbsG)} פח&apos; ·{" "}
              {Math.round(day.totals.fatG)} שו · {Math.round(day.totals.proteinG)} חל&apos;
              {day.entryCount > 0 && ` · ${day.entryCount} פריטים`}
            </p>
          </div>
          {day.weightKg !== null && (
            <span className="shrink-0 rounded-full border border-surface-border bg-surface px-3 py-1 text-xs tabular-nums text-ink-soft">
              {day.weightKg} ק&quot;ג
            </span>
          )}
        </Link>
      ))}

      {error && <p className="mt-3 text-sm text-warn">{error}</p>}
      {cursor && (
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" onClick={loadMore} disabled={isPending}>
            {isPending ? "טוען..." : "טען עוד"}
          </Button>
        </div>
      )}
    </div>
  );
}
