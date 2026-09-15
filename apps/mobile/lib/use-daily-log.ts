import { useCallback, useEffect, useState } from "react";
import type { LogEntry, MacroTotals, NutritionGoal, WeightEntry } from "@foodtrack/shared-types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

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

export function useDailyLog(date: string) {
  const { token } = useAuth();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [goal, setGoal] = useState<NutritionGoal | null>(null);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [recentManualFoods, setRecentManualFoods] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [entriesRes, goalRes, weightRes, recentRes] = await Promise.all([
        apiFetch<LogEntry[]>(`/log-entries?date=${date}`, { token }),
        apiFetch<NutritionGoal | null>("/nutrition-goals", { token }),
        apiFetch<WeightEntry[]>(`/weight-entries?from=${date}&to=${date}`, { token }),
        apiFetch<LogEntry[]>("/log-entries/recent-manual", { token }),
      ]);
      setEntries(entriesRes);
      setGoal(goalRes);
      setWeightEntries(weightRes);
      setRecentManualFoods(recentRes);
    } finally {
      setLoading(false);
    }
  }, [token, date]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    entries,
    goal,
    todaysWeight: weightEntries[0]?.weightKg ?? null,
    recentManualFoods,
    totals: sumTotals(entries),
    loading,
    refetch,
  };
}
