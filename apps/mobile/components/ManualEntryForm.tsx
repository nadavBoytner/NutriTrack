import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { LogEntry, LogEntryUnit } from "@foodtrack/shared-types";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

type Mode = "per100g" | "perPortion";
const EMPTY = { calories: "", carbsG: "", fatG: "", proteinG: "" };

export function ManualEntryForm({
  date,
  recentFoods,
  onAdded,
}: {
  date: string;
  recentFoods: LogEntry[];
  onAdded: () => void;
}) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("per100g");
  const [amount, setAmount] = useState("100");
  const [perUnit, setPerUnit] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function applyRecent(food: LogEntry) {
    const nextMode: Mode = food.quantityUnit === "portion" ? "perPortion" : "per100g";
    const factor = nextMode === "perPortion" ? food.quantityG : food.quantityG / 100;
    setName(food.customName ?? "");
    setMode(nextMode);
    setAmount(String(food.quantityG));
    setPerUnit(
      factor
        ? {
            calories: round1(food.calories / factor),
            carbsG: round1(food.carbsG / factor),
            fatG: round1(food.fatG / factor),
            proteinG: round1(food.proteinG / factor),
          }
        : EMPTY,
    );
    setOpen(true);
  }

  const amountNum = Number(amount) || 0;
  const factor = mode === "perPortion" ? amountNum : amountNum / 100;
  const totals = {
    calories: (Number(perUnit.calories) || 0) * factor,
    carbsG: (Number(perUnit.carbsG) || 0) * factor,
    fatG: (Number(perUnit.fatG) || 0) * factor,
    proteinG: (Number(perUnit.proteinG) || 0) * factor,
  };

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError("יש להזין שם למאכל");
      return;
    }
    if (!amountNum) {
      setError(mode === "perPortion" ? "יש להזין מספר מנות" : "יש להזין כמות בגרמים");
      return;
    }
    setSaving(true);
    try {
      const quantityUnit: LogEntryUnit = mode === "perPortion" ? "portion" : "g";
      await apiFetch("/log-entries", {
        method: "POST",
        token,
        body: { date, customName: name.trim(), quantityG: amountNum, quantityUnit, ...totals },
      });
      setName("");
      setMode("per100g");
      setAmount("100");
      setPerUnit(EMPTY);
      onAdded();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <Pressable onPress={() => setOpen((v) => !v)}>
        <Text style={styles.toggle}>הוספה ידנית {open ? "▲" : "▼"}</Text>
      </Pressable>

      {open && (
        <View style={styles.body}>
          {recentFoods.length > 0 && (
            <View style={styles.recentWrap}>
              <Text style={styles.recentLabel}>מאכלים שהוספתי לאחרונה</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipsRow}>
                  {recentFoods.map((food) => (
                    <Pressable key={food.id} style={styles.chip} onPress={() => applyRecent(food)}>
                      <Text style={styles.chipText}>{food.customName}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <Field label="שם המאכל">
            <Input value={name} onChangeText={setName} textAlign="right" />
          </Field>

          <View style={styles.modeRow}>
            <Pressable onPress={() => setMode("per100g")}>
              <Text style={[styles.modeText, mode === "per100g" && styles.modeTextActive]}>לפי 100 גרם</Text>
            </Pressable>
            <Pressable onPress={() => setMode("perPortion")}>
              <Text style={[styles.modeText, mode === "perPortion" && styles.modeTextActive]}>לפי מנה</Text>
            </Pressable>
          </View>

          <Field label={mode === "perPortion" ? "מספר מנות" : "כמות (גר')"}>
            <Input value={amount} onChangeText={setAmount} keyboardType="decimal-pad" textAlign="right" />
          </Field>

          <View style={styles.grid}>
            <MacroField
              label={mode === "perPortion" ? "קלוריות למנה" : "קלוריות ל-100 גר'"}
              value={perUnit.calories}
              onChange={(v) => setPerUnit((p) => ({ ...p, calories: v }))}
            />
            <MacroField
              label={mode === "perPortion" ? "פחמימות למנה" : "פחמימות ל-100 גר'"}
              value={perUnit.carbsG}
              onChange={(v) => setPerUnit((p) => ({ ...p, carbsG: v }))}
            />
            <MacroField
              label={mode === "perPortion" ? "שומן למנה" : "שומן ל-100 גר'"}
              value={perUnit.fatG}
              onChange={(v) => setPerUnit((p) => ({ ...p, fatG: v }))}
            />
            <MacroField
              label={mode === "perPortion" ? "חלבון למנה" : "חלבון ל-100 גר'"}
              value={perUnit.proteinG}
              onChange={(v) => setPerUnit((p) => ({ ...p, proteinG: v }))}
            />
          </View>

          <Text style={styles.total}>
            סה&quot;כ: {Math.round(totals.calories)} קל&apos; · פח&apos; {Math.round(totals.carbsG)} · שו{" "}
            {Math.round(totals.fatG)} · חל&apos; {Math.round(totals.proteinG)}
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <Button label="הוספה לרשימה" variant="ghost" loading={saving} onPress={handleSubmit} />
        </View>
      )}
    </View>
  );
}

function MacroField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.macroField}>
      <Text style={styles.macroLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        textAlign="right"
        style={styles.macroInput}
      />
    </View>
  );
}

function round1(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

const styles = StyleSheet.create({
  toggle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "right",
    paddingVertical: 8,
  },
  body: {
    marginTop: 8,
  },
  recentWrap: {
    marginBottom: 16,
  },
  recentLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "right",
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
  },
  modeRow: {
    flexDirection: "row-reverse",
    gap: 16,
    marginBottom: 16,
  },
  modeText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkSoft,
    paddingBottom: 4,
  },
  modeTextActive: {
    color: colors.ink,
    fontFamily: fonts.sansMedium,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  macroField: {
    width: "45%",
  },
  macroLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: "right",
    marginBottom: 4,
  },
  macroInput: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 6,
  },
  total: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "right",
    marginBottom: 12,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.warn,
    textAlign: "right",
    marginBottom: 8,
  },
});
