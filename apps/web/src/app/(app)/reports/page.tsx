import type { Metadata } from "next";
import Link from "next/link";
import type { MacroReport, ReportPeriod, WeightEntry } from "@foodtrack/shared-types";
import { CircularGauge } from "@/components/CircularGauge";
import { WeightTrendChart } from "@/components/WeightTrendChart";
import { apiFetch } from "@/lib/api";
import { requireToken } from "@/lib/auth";
import { addDaysISO, daysBetweenISO, todayISO } from "@/lib/dates";

export const metadata: Metadata = { title: "דוחות" };

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "daily", label: "יומי" },
  { value: "weekly", label: "שבועי" },
  { value: "monthly", label: "חודשי" },
];

export default async function ReportsPage(props: PageProps<"/reports">) {
  const token = await requireToken();
  const searchParams = await props.searchParams;
  const periodParam = searchParams.period;
  const period: ReportPeriod =
    periodParam === "weekly" || periodParam === "monthly" ? periodParam : "daily";
  const date = todayISO();
  const trendFrom = addDaysISO(date, -29);

  const [report, weightTrend] = await Promise.all([
    apiFetch<MacroReport>(`/reports/macros?period=${period}&date=${date}`, { token }),
    apiFetch<WeightEntry[]>(`/weight-entries?from=${trendFrom}&to=${date}`, { token }),
  ]);

  const days = daysBetweenISO(report.from, report.to);
  const average =
    days > 1
      ? {
          calories: report.totals.calories / days,
          carbsG: report.totals.carbsG / days,
          fatG: report.totals.fatG / days,
          proteinG: report.totals.proteinG / days,
        }
      : null;
  const dailyGoal =
    average && report.goal
      ? {
          calories: report.goal.calories / days,
          carbsG: report.goal.carbsG / days,
          fatG: report.goal.fatG / days,
          proteinG: report.goal.proteinG / days,
        }
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-4 font-display text-xl font-bold tracking-tight">דוחות</h1>
        <nav className="glass-panel flex w-fit gap-1 p-1 text-sm">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/reports?period=${p.value}`}
              className={`rounded-full px-4 py-1.5 transition-colors duration-200 ${
                p.value === period ? "bg-good-fill text-on-fill" : "text-ink-soft hover:text-ink"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </nav>
      </div>

      <section className="glass-panel space-y-4 p-5 lg:p-6">
        <div className="flex items-baseline justify-between">
          {average && <h2 className="font-display text-lg font-bold tracking-tight">סה&quot;כ לתקופה</h2>}
          <p dir="ltr" className="text-right text-sm text-ink-soft">
            {report.from === report.to ? report.from : `${report.from} – ${report.to}`}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <CircularGauge label="קלוריות" current={report.totals.calories} goal={report.goal?.calories ?? null} unit="קל'" />
          <CircularGauge label="פחמימות" current={report.totals.carbsG} goal={report.goal?.carbsG ?? null} unit="גר'" />
          <CircularGauge label="שומן" current={report.totals.fatG} goal={report.goal?.fatG ?? null} unit="גר'" />
          <CircularGauge label="חלבון" current={report.totals.proteinG} goal={report.goal?.proteinG ?? null} unit="גר'" />
        </div>
        {!report.goal && (
          <p className="text-sm text-ink-soft">
            עדיין לא הוגדרו יעדי תזונה. אפשר להגדיר אותם ב
            <Link href="/profile" className="text-link underline underline-offset-2">
              דף הפרופיל
            </Link>
            .
          </p>
        )}
      </section>

      {average && (
        <section className="glass-panel space-y-4 p-5 lg:p-6">
          <h2 className="font-display text-lg font-bold tracking-tight">ממוצע יומי</h2>
          <div className="grid grid-cols-4 gap-2">
            <CircularGauge label="קלוריות" current={average.calories} goal={dailyGoal?.calories ?? null} unit="קל'" />
            <CircularGauge label="פחמימות" current={average.carbsG} goal={dailyGoal?.carbsG ?? null} unit="גר'" />
            <CircularGauge label="שומן" current={average.fatG} goal={dailyGoal?.fatG ?? null} unit="גר'" />
            <CircularGauge label="חלבון" current={average.proteinG} goal={dailyGoal?.proteinG ?? null} unit="גר'" />
          </div>
        </section>
      )}

      <section className="glass-panel p-5 lg:p-6">
        <h2 className="mb-3 font-display text-lg font-bold tracking-tight">מגמת משקל (30 יום אחרונים)</h2>
        <WeightTrendChart entries={weightTrend} />
      </section>
    </div>
  );
}
