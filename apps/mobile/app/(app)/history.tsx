import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DayHistory } from "@foodtrack/shared-types";
import { Button } from "@/components/Button";
import { GlassPanel } from "@/components/GlassPanel";
import { Screen } from "@/components/Screen";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { formatHebrewDate } from "@/lib/dates";
import { fonts } from "@/lib/fonts";

export default function HistoryScreen() {
  const { token } = useAuth();
  const [days, setDays] = useState<DayHistory[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ days: DayHistory[]; nextCursor: string | null }>("/log-entries/history", { token })
      .then((page) => {
        setDays(page.days);
        setCursor(page.nextCursor);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "טעינת ההיסטוריה נכשלה, נסו שוב");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await apiFetch<{ days: DayHistory[]; nextCursor: string | null }>(
        `/log-entries/history?cursor=${cursor}`,
        { token },
      );
      setDays((prev) => [...prev, ...page.days]);
      setCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "טעינת ההיסטוריה נכשלה, נסו שוב");
    } finally {
      setLoadingMore(false);
    }
  }

  function openDay(date: string) {
    router.push({ pathname: "/(app)", params: { date } } as unknown as Href);
  }

  return (
    <Screen>
      <Text style={styles.heading}>היסטוריה</Text>
      <GlassPanel>
        {loading ? (
          <Text style={styles.empty}>טוען...</Text>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : days.length === 0 ? (
          <Text style={styles.empty}>עדיין אין היסטוריה להצגה.</Text>
        ) : (
          <>
            {days.map((day, i) => (
              <Pressable
                key={day.date}
                onPress={() => openDay(day.date)}
                style={[styles.row, i === days.length - 1 && styles.rowLast]}
              >
                <View style={styles.rowText}>
                  <Text style={styles.date}>{formatHebrewDate(day.date)}</Text>
                  <Text style={styles.macros} numberOfLines={1}>
                    {Math.round(day.totals.calories)} קל&apos; · {Math.round(day.totals.carbsG)} פח&apos; ·{" "}
                    {Math.round(day.totals.fatG)} שו · {Math.round(day.totals.proteinG)} חל&apos;
                    {day.entryCount > 0 ? ` · ${day.entryCount} פריטים` : ""}
                  </Text>
                </View>
                {day.weightKg !== null && (
                  <View style={styles.weightBadge}>
                    <Text style={styles.weightText}>{day.weightKg} ק&quot;ג</Text>
                  </View>
                )}
              </Pressable>
            ))}
            {error && <Text style={styles.error}>{error}</Text>}
            {cursor && (
              <View style={styles.loadMoreRow}>
                <Button variant="ghost" label="טען עוד" loading={loadingMore} onPress={loadMore} />
              </View>
            )}
          </>
        )}
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
  empty: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "right",
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.warn,
    textAlign: "right",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 14,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowText: {
    flex: 1,
  },
  date: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: colors.ink,
    textAlign: "right",
  },
  macros: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: "right",
    marginTop: 4,
  },
  weightBadge: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  weightText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkSoft,
  },
  loadMoreRow: {
    marginTop: 12,
    alignItems: "center",
  },
});
