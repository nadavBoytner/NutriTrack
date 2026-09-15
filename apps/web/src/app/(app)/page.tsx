import Link from "next/link";
import type { LogEntry, MacroTotals, NutritionGoal, WeightEntry } from "@foodtrack/shared-types";
import { deleteLogEntryAction } from "@/app/actions/log";
import { Button } from "@/components/Button";
import { CircularGauge } from "@/components/CircularGauge";
import { FoodSearch } from "@/components/FoodSearch";
import { ManualEntryForm } from "@/components/ManualEntryForm";
import { WeighInForm } from "@/components/WeighInForm";
import { apiFetch } from "@/lib/api";
import { requireToken } from "@/lib/auth";
import { addDaysISO, formatHebrewDate, todayISO } from "@/lib/dates";

function sumTotals(entries: LogEntry[]): MacroTotals {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      carbsG: acc.carbsG + entry.carbsG,
      fatG: acc.fatG + entry.fatG,
      proteinG: acc.proteinG + entry.proteinG,
    }),
    { calories: 0, carbsG: 0, fatG: 0, proteinG: 0 },
  );
}

export default async function LogPage(props: PageProps<"/">) {
  const token = await requireToken();
  const searchParams = await props.searchParams;
  const dateParam = searchParams.date;
  const date = typeof dateParam === "string" ? dateParam : todayISO();
  const isToday = date === todayISO();

  const [entries, goal, weightEntries, recentManualFoods] = await Promise.all([
    apiFetch<LogEntry[]>(`/log-entries?date=${date}`, { token }),
    apiFetch<NutritionGoal | null>("/nutrition-goals", { token }),
    apiFetch<WeightEntry[]>(`/weight-entries?from=${date}&to=${date}`, { token }),
    apiFetch<LogEntry[]>("/log-entries/recent-manual", { token }),
  ]);

  const totals = sumTotals(entries);
  const todaysWeight = weightEntries[0]?.weightKg ?? null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href={`/?date=${addDaysISO(date, -1)}`} className="text-ink-soft hover:text-ink">
          ← יום קודם
        </Link>
        <div className="text-center">
          <h1 className="font-display text-xl font-medium">{formatHebrewDate(date)}</h1>
          {!isToday && (
            <Link href="/" className="text-xs text-link underline underline-offset-2">
              חזרה להיום
            </Link>
          )}
        </div>
        <Link href={`/?date=${addDaysISO(date, 1)}`} className="text-ink-soft hover:text-ink">
          יום הבא →
        </Link>
      </div>

      <section className="space-y-4 border-b border-line pb-8">
        <div className="grid grid-cols-4 gap-2">
          <CircularGauge label="קלוריות" current={totals.calories} goal={goal?.dailyCalories ?? null} unit="קל'" />
          <CircularGauge label="פחמימות" current={totals.carbsG} goal={goal?.dailyCarbsG ?? null} unit="גר'" />
          <CircularGauge label="שומן" current={totals.fatG} goal={goal?.dailyFatG ?? null} unit="גר'" />
          <CircularGauge label="חלבון" current={totals.proteinG} goal={goal?.dailyProteinG ?? null} unit="גר'" />
        </div>
        {!goal && (
          <p className="text-sm text-ink-soft">
            עדיין לא הוגדרו יעדי תזונה. אפשר להגדיר אותם ב
            <Link href="/profile" className="text-link underline underline-offset-2">
              דף הפרופיל
            </Link>
            .
          </p>
        )}
      </section>

      <section className="border-b border-line pb-8">
        <WeighInForm date={date} initialWeightKg={todaysWeight} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-medium">מה אכלתי</h2>

        {entries.length > 0 ? (
          <ul className="mb-4 divide-y divide-line border-y border-line">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate">{entry.customName ?? entry.foodItem?.name ?? "פריט"}</p>
                  <p className="text-xs tabular-nums text-ink-soft">
                    {Math.round(entry.quantityG)} {entry.quantityUnit === "portion" ? "מנות" : "גר'"} ·{" "}
                    {Math.round(entry.calories)} קל&apos; · פח&apos; {Math.round(entry.carbsG)} · שו{" "}
                    {Math.round(entry.fatG)} · חל&apos; {Math.round(entry.proteinG)}
                  </p>
                </div>
                <form action={deleteLogEntryAction.bind(null, entry.id)}>
                  <Button type="submit" variant="danger">
                    מחיקה
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-ink-soft">עדיין לא נרשמו פריטים ליום הזה.</p>
        )}

        <FoodSearch date={date} />
        <ManualEntryForm date={date} recentFoods={recentManualFoods} />
      </section>
    </div>
  );
}
