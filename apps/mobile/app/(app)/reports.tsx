import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MacroReport, ReportPeriod, WeightEntry } from "@foodtrack/shared-types";
import { CircularGauge } from "@/components/CircularGauge";
import { GlassPanel } from "@/components/GlassPanel";
import { Screen } from "@/components/Screen";
import { WeightTrendChart } from "@/components/WeightTrendChart";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { addDaysISO, daysBetweenISO, todayISO } from "@/lib/dates";
import { fonts } from "@/lib/fonts";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "daily", label: "יומי" },
  { value: "weekly", label: "שבועי" },
  { value: "monthly", label: "חודשי" },
];

export default function ReportsScreen() {
  const { token } = useAuth();
  const [period, setPeriod] = useState<ReportPeriod>("daily");
  const [report, setReport] = useState<MacroReport | null>(null);
  const [weightTrend, setWeightTrend] = useState<WeightEntry[]>([]);

  useEffect(() => {
    const date = todayISO();
    const trendFrom = addDaysISO(date, -29);
    Promise.all([
      apiFetch<MacroReport>(`/reports/macros?period=${period}&date=${date}`, { token }),
      apiFetch<WeightEntry[]>(`/weight-entries?from=${trendFrom}&to=${date}`, { token }),
    ]).then(([r, w]) => {
      setReport(r);
      setWeightTrend(w);
    });
  }, [token, period]);

  if (!report) {
    return (
      <Screen>
        <Text style={styles.heading}>דוחות</Text>
      </Screen>
    );
  }

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
    <Screen>
      <Text style={styles.heading}>דוחות</Text>
      <View style={styles.tabs}>
        {PERIODS.map((p) => (
          <Pressable
            key={p.value}
            onPress={() => setPeriod(p.value)}
            style={[styles.tab, p.value === period && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, p.value === period && styles.tabLabelActive]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      <GlassPanel style={styles.panelSpacing} contentStyle={styles.sectionContent}>
        <View style={styles.sectionHeader}>
          {average && <Text style={styles.sectionTitle}>סה&quot;כ לתקופה</Text>}
          <Text style={styles.range}>{report.from === report.to ? report.from : `${report.from} – ${report.to}`}</Text>
        </View>
        <View style={styles.gauges}>
          <CircularGauge label="קלוריות" current={report.totals.calories} goal={report.goal?.calories ?? null} unit="קל'" />
          <CircularGauge label="פחמימות" current={report.totals.carbsG} goal={report.goal?.carbsG ?? null} unit="גר'" />
          <CircularGauge label="שומן" current={report.totals.fatG} goal={report.goal?.fatG ?? null} unit="גר'" />
          <CircularGauge label="חלבון" current={report.totals.proteinG} goal={report.goal?.proteinG ?? null} unit="גר'" />
        </View>
        {!report.goal && (
          <Text style={styles.noGoal}>
            עדיין לא הוגדרו יעדי תזונה. אפשר להגדיר אותם ב
            <Link href="/profile" style={styles.link}>
              דף הפרופיל
            </Link>
            .
          </Text>
        )}
      </GlassPanel>

      {average && (
        <GlassPanel style={styles.panelSpacing} contentStyle={styles.sectionContent}>
          <Text style={styles.sectionTitle}>ממוצע יומי</Text>
          <View style={styles.gauges}>
            <CircularGauge label="קלוריות" current={average.calories} goal={dailyGoal?.calories ?? null} unit="קל'" />
            <CircularGauge label="פחמימות" current={average.carbsG} goal={dailyGoal?.carbsG ?? null} unit="גר'" />
            <CircularGauge label="שומן" current={average.fatG} goal={dailyGoal?.fatG ?? null} unit="גר'" />
            <CircularGauge label="חלבון" current={average.proteinG} goal={dailyGoal?.proteinG ?? null} unit="גר'" />
          </View>
        </GlassPanel>
      )}

      <GlassPanel style={styles.panelSpacing} contentStyle={styles.sectionContent}>
        <Text style={styles.sectionTitle}>מגמת משקל (30 יום אחרונים)</Text>
        <WeightTrendChart entries={weightTrend} />
      </GlassPanel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.ink,
    textAlign: "right",
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row-reverse",
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 999,
    padding: 4,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: colors.goodFill,
  },
  tabLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
  },
  tabLabelActive: {
    color: colors.onFill,
    fontFamily: fonts.sansMedium,
  },
  panelSpacing: {
    marginTop: 16,
  },
  sectionContent: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.ink,
    textAlign: "right",
  },
  range: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkSoft,
  },
  gauges: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  noGoal: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "right",
  },
  link: {
    color: colors.link,
    textDecorationLine: "underline",
  },
});
