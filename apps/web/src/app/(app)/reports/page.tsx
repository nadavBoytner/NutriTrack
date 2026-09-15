import Link from "next/link";
import type { MacroReport, ReportPeriod, WeightEntry } from "@foodtrack/shared-types";
import { CircularGauge } from "@/components/CircularGauge";
import { WeightTrendChart } from "@/components/WeightTrendChart";
import { apiFetch } from "@/lib/api";
import { requireToken } from "@/lib/auth";
import { addDaysISO, todayISO } from "@/lib/dates";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 font-display text-xl font-medium">דוחות</h1>
        <nav className="flex gap-5 border-b border-line text-sm">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/reports?period=${p.value}`}
              className={`-mb-px border-b-2 pb-2 ${
                p.value === period ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </nav>
      </div>

      <section className="space-y-4 border-b border-line pb-8">
        <p dir="ltr" className="text-right text-sm text-ink-soft">
          {report.from === report.to ? report.from : `${report.from} – ${report.to}`}
        </p>
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

      <section>
        <h2 className="mb-3 font-display text-lg font-medium">מגמת משקל (30 יום אחרונים)</h2>
        <WeightTrendChart entries={weightTrend} />
      </section>
    </div>
  );
}
