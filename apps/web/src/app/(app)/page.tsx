import type { Metadata } from "next";
import Link from "next/link";
import type { LogEntry, MacroTotals, NutritionGoal, WeightEntry } from "@foodtrack/shared-types";
import { deleteLogEntryAction } from "@/app/actions/log";
import { AiMealParser } from "@/components/AiMealParser";
import { CircularGauge } from "@/components/CircularGauge";
import { FoodSearch } from "@/components/FoodSearch";
import { ManualEntryForm } from "@/components/ManualEntryForm";
import { RemoveButton } from "@/components/RemoveButton";
import { WeighInForm } from "@/components/WeighInForm";
import { apiFetch } from "@/lib/api";
import { requireToken } from "@/lib/auth";
import { addDaysISO, formatHebrewDate, todayISO } from "@/lib/dates";

export const metadata: Metadata = { title: "יומן" };

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

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:items-start lg:gap-12">
        <div className="space-y-8 lg:sticky lg:top-10 lg:pb-8">
          <section className="space-y-4 border-b border-line pb-8 lg:border-b-0 lg:pb-0">
            <div className="grid grid-cols-4 gap-2 lg:grid-cols-2 lg:gap-y-6">
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

          <section className="border-b border-line pb-8 lg:border-b-0 lg:border-t lg:pb-0 lg:pt-8">
            <WeighInForm date={date} initialWeightKg={todaysWeight} />
          </section>
        </div>

        <section className="mt-8 lg:mt-0">
          <h2 className="mb-3 font-display text-lg font-medium">מה אכלתי</h2>

          {entries.length > 0 ? (
            <div className="mb-4 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-ink text-xs text-ink-soft">
                    <th className="py-2 text-start font-normal">מאכל</th>
                    <th className="py-2 text-start font-normal">כמות</th>
                    <th className="py-2 text-start font-normal">קל&apos;</th>
                    <th className="py-2 text-start font-normal">פח&apos;</th>
                    <th className="py-2 text-start font-normal">שו</th>
                    <th className="py-2 text-start font-normal">חל&apos;</th>
                    <th className="py-2" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-line transition-colors hover:bg-paper-raised/60">
                      <td className="max-w-40 truncate py-2.5 pe-2">
                        {entry.customName ?? entry.foodItem?.name ?? "פריט"}
                        {entry.source === "ai_estimated" && (
                          <span className="mr-2 inline-block rounded bg-highlight-soft px-1.5 py-0.5 align-middle text-[11px] text-highlight">
                            הערכת AI
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-2.5 pe-2 tabular-nums text-ink-soft">
                        {Math.round(entry.quantityG)} {entry.quantityUnit === "portion" ? "מנות" : "גר'"}
                      </td>
                      <td className="py-2.5 pe-2 tabular-nums">{Math.round(entry.calories)}</td>
                      <td className="py-2.5 pe-2 tabular-nums text-ink-soft">{Math.round(entry.carbsG)}</td>
                      <td className="py-2.5 pe-2 tabular-nums text-ink-soft">{Math.round(entry.fatG)}</td>
                      <td className="py-2.5 pe-2 tabular-nums text-ink-soft">{Math.round(entry.proteinG)}</td>
                      <td className="py-2.5 text-end">
                        <RemoveButton
                          onRemove={deleteLogEntryAction.bind(null, entry.id)}
                          itemLabel={entry.customName ?? entry.foodItem?.name ?? "פריט"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mb-4 text-sm text-ink-soft">עדיין לא נרשמו פריטים ליום הזה.</p>
          )}

          <AiMealParser date={date} />
          <FoodSearch date={date} />
          <ManualEntryForm date={date} recentFoods={recentManualFoods} />
        </section>
      </div>
    </div>
  );
}
