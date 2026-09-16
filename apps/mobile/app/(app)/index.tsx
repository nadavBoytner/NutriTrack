import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AiMealParser } from "@/components/AiMealParser";
import { CircularGauge } from "@/components/CircularGauge";
import { FoodSearch } from "@/components/FoodSearch";
import { ManualEntryForm } from "@/components/ManualEntryForm";
import { Screen } from "@/components/Screen";
import { RemoveButton } from "@/components/RemoveButton";
import { ACTION_WIDTH, Cell, COL, HeaderCell, HeaderRow, Row, TableWrap } from "@/components/Table";
import { WeighInForm } from "@/components/WeighInForm";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { addDaysISO, formatHebrewDate, todayISO } from "@/lib/dates";
import { fonts } from "@/lib/fonts";
import { useDailyLog } from "@/lib/use-daily-log";

export default function LogScreen() {
  const { token } = useAuth();
  const [date, setDate] = useState(todayISO());
  const isToday = date === todayISO();
  const { entries, goal, todaysWeight, recentManualFoods, totals, refetch } = useDailyLog(date);

  async function handleDelete(id: string) {
    await apiFetch(`/log-entries/${id}`, { method: "DELETE", token });
    refetch();
  }

  return (
    <Screen>
      <View style={styles.dateNav}>
        <Pressable onPress={() => setDate((d) => addDaysISO(d, -1))}>
          <Text style={styles.navArrow}>← יום קודם</Text>
        </Pressable>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{formatHebrewDate(date)}</Text>
          {!isToday && (
            <Pressable onPress={() => setDate(todayISO())}>
              <Text style={styles.today}>חזרה להיום</Text>
            </Pressable>
          )}
        </View>
        <Pressable onPress={() => setDate((d) => addDaysISO(d, 1))}>
          <Text style={styles.navArrow}>יום הבא →</Text>
        </Pressable>
      </View>

      <View style={styles.gauges}>
        <CircularGauge label="קלוריות" current={totals.calories} goal={goal?.dailyCalories ?? null} unit="קל'" />
        <CircularGauge label="פחמימות" current={totals.carbsG} goal={goal?.dailyCarbsG ?? null} unit="גר'" />
        <CircularGauge label="שומן" current={totals.fatG} goal={goal?.dailyFatG ?? null} unit="גר'" />
        <CircularGauge label="חלבון" current={totals.proteinG} goal={goal?.dailyProteinG ?? null} unit="גר'" />
      </View>
      {!goal && (
        <Text style={styles.noGoal}>
          עדיין לא הוגדרו יעדי תזונה. אפשר להגדיר אותם ב
          <Link href="/profile" style={styles.link}>
            דף הפרופיל
          </Link>
          .
        </Text>
      )}

      <View style={styles.section}>
        <WeighInForm date={date} initialWeightKg={todaysWeight} onSaved={refetch} />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>מה אכלתי</Text>
        {entries.length > 0 ? (
          <TableWrap>
            <HeaderRow>
              <HeaderCell flex={COL.name}>מאכל</HeaderCell>
              <HeaderCell flex={COL.qty}>כמות</HeaderCell>
              <HeaderCell flex={COL.macro}>קל&apos;</HeaderCell>
              <HeaderCell flex={COL.macro}>פח&apos;</HeaderCell>
              <HeaderCell flex={COL.macro}>שו</HeaderCell>
              <HeaderCell flex={COL.macro}>חל&apos;</HeaderCell>
              <HeaderCell width={ACTION_WIDTH}> </HeaderCell>
            </HeaderRow>
            {entries.map((entry) => (
              <Row key={entry.id}>
                <Cell flex={COL.name}>
                  <Text style={styles.entryName} numberOfLines={1}>
                    {entry.customName ?? entry.foodItem?.name ?? "פריט"}
                  </Text>
                  {entry.source === "ai_estimated" && <Text style={styles.aiBadge}>הערכת AI</Text>}
                </Cell>
                <Cell flex={COL.qty}>
                  <Text style={styles.entryValue} numberOfLines={1}>
                    {Math.round(entry.quantityG)} {entry.quantityUnit === "portion" ? "מנות" : "גר'"}
                  </Text>
                </Cell>
                <Cell flex={COL.macro}>
                  <Text style={styles.entryValue}>{Math.round(entry.calories)}</Text>
                </Cell>
                <Cell flex={COL.macro}>
                  <Text style={styles.entryValue}>{Math.round(entry.carbsG)}</Text>
                </Cell>
                <Cell flex={COL.macro}>
                  <Text style={styles.entryValue}>{Math.round(entry.fatG)}</Text>
                </Cell>
                <Cell flex={COL.macro}>
                  <Text style={styles.entryValue}>{Math.round(entry.proteinG)}</Text>
                </Cell>
                <Cell width={ACTION_WIDTH}>
                  <RemoveButton onPress={() => handleDelete(entry.id)} />
                </Cell>
              </Row>
            ))}
          </TableWrap>
        ) : (
          <Text style={styles.empty}>עדיין לא נרשמו פריטים ליום הזה.</Text>
        )}
      </View>

      <View style={styles.section}>
        <AiMealParser date={date} onAdded={refetch} />
      </View>

      <View style={styles.section}>
        <FoodSearch date={date} onAdded={refetch} />
      </View>

      <View style={styles.section}>
        <ManualEntryForm date={date} recentFoods={recentManualFoods} onAdded={refetch} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dateNav: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  navArrow: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
  },
  dateCenter: {
    alignItems: "center",
  },
  dateText: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.ink,
  },
  today: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.link,
    textDecorationLine: "underline",
    marginTop: 2,
  },
  gauges: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  noGoal: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "right",
    marginBottom: 8,
  },
  link: {
    color: colors.link,
    textDecorationLine: "underline",
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 20,
    marginTop: 20,
  },
  heading: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.ink,
    textAlign: "right",
    marginBottom: 12,
  },
  entryName: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    textAlign: "right",
  },
  aiBadge: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.highlight,
    backgroundColor: colors.highlightSoft,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: "flex-end",
    overflow: "hidden",
  },
  entryValue: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "center",
  },
  empty: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "right",
  },
});
