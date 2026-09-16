import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { AiParsedItem } from "@foodtrack/shared-types";
import { Button } from "@/components/Button";
import { RemoveButton } from "@/components/RemoveButton";
import { ACTION_WIDTH, Cell, COL, HeaderCell, HeaderRow, Row, TableWrap } from "@/components/Table";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

interface Rate {
  calories: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
}
interface DraftItem extends AiParsedItem {
  key: string;
  ratePerG?: Rate;
}

function toDraft(item: AiParsedItem): DraftItem {
  const ratePerG =
    item.source === "db" && item.quantityG > 0
      ? {
          calories: item.calories / item.quantityG,
          carbsG: item.carbsG / item.quantityG,
          fatG: item.fatG / item.quantityG,
          proteinG: item.proteinG / item.quantityG,
        }
      : undefined;
  return { ...item, key: `${item.customName}-${Math.random()}`, ratePerG };
}

export function AiMealParser({ date, onAdded }: { date: string; onAdded: () => void }) {
  const { token } = useAuth();
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleParse() {
    if (!text.trim()) return;
    setError(null);
    setParsing(true);
    try {
      const items = await apiFetch<AiParsedItem[]>("/log-entries/ai-parse", {
        method: "POST",
        token,
        body: { text },
      });
      setDrafts(items.map(toDraft));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "הפירוק נכשל, נסו שוב");
    } finally {
      setParsing(false);
    }
  }

  function updateDraft(key: string, patch: Partial<DraftItem>) {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function handleQuantityChange(item: DraftItem, quantityG: number) {
    if (item.ratePerG) {
      updateDraft(item.key, {
        quantityG,
        calories: item.ratePerG.calories * quantityG,
        carbsG: item.ratePerG.carbsG * quantityG,
        fatG: item.ratePerG.fatG * quantityG,
        proteinG: item.ratePerG.proteinG * quantityG,
      });
    } else {
      updateDraft(item.key, { quantityG });
    }
  }

  function removeDraft(key: string) {
    setDrafts((prev) => prev.filter((d) => d.key !== key));
  }

  async function handleConfirm() {
    setConfirming(true);
    try {
      await Promise.all(
        drafts.map((item) =>
          item.foodItemId
            ? apiFetch("/log-entries", {
                method: "POST",
                token,
                body: { date, foodItemId: item.foodItemId, quantityG: item.quantityG },
              })
            : apiFetch("/log-entries", {
                method: "POST",
                token,
                body: {
                  date,
                  customName: item.customName,
                  source: "ai_estimated",
                  quantityG: item.quantityG,
                  calories: item.calories,
                  carbsG: item.carbsG,
                  fatG: item.fatG,
                  proteinG: item.proteinG,
                },
              }),
        ),
      );
      setDrafts([]);
      setText("");
      onAdded();
    } finally {
      setConfirming(false);
    }
  }

  return (
    <View>
      <Text style={styles.heading}>מה אכלת?</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="ספר/י בחופשיות, למשל: אכלתי סלט עוף וכוס אורז"
        placeholderTextColor={colors.inkSoft + "99"}
        multiline
        numberOfLines={2}
        textAlign="right"
        style={styles.textarea}
      />
      <View style={styles.parseRow}>
        <Button variant="ghost" label="פירוק עם AI" loading={parsing} disabled={!text.trim()} onPress={handleParse} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {drafts.length > 0 && (
        <View style={styles.draftsWrap}>
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
            {drafts.map((item) => (
              <Row key={item.key}>
                <Cell flex={COL.name}>
                  <TextInput
                    value={item.customName}
                    onChangeText={(v) => updateDraft(item.key, { customName: v })}
                    textAlign="right"
                    style={styles.nameInput}
                  />
                  <Text style={[styles.badge, item.source === "db" ? styles.badgeDb : styles.badgeAi]}>
                    {item.source === "db" ? "מהמאגר" : "הערכת AI"}
                  </Text>
                </Cell>
                <Cell flex={COL.qty}>
                  <TextInput
                    value={String(Math.round(item.quantityG))}
                    onChangeText={(v) => handleQuantityChange(item, Number(v) || 0)}
                    keyboardType="number-pad"
                    textAlign="center"
                    style={styles.cellInput}
                  />
                </Cell>
                <Cell flex={COL.macro}>
                  <MacroCell
                    value={item.calories}
                    editable={item.source !== "db"}
                    onChange={(v) => updateDraft(item.key, { calories: v })}
                  />
                </Cell>
                <Cell flex={COL.macro}>
                  <MacroCell
                    value={item.carbsG}
                    editable={item.source !== "db"}
                    onChange={(v) => updateDraft(item.key, { carbsG: v })}
                  />
                </Cell>
                <Cell flex={COL.macro}>
                  <MacroCell
                    value={item.fatG}
                    editable={item.source !== "db"}
                    onChange={(v) => updateDraft(item.key, { fatG: v })}
                  />
                </Cell>
                <Cell flex={COL.macro}>
                  <MacroCell
                    value={item.proteinG}
                    editable={item.source !== "db"}
                    onChange={(v) => updateDraft(item.key, { proteinG: v })}
                  />
                </Cell>
                <Cell width={ACTION_WIDTH}>
                  <RemoveButton onPress={() => removeDraft(item.key)} />
                </Cell>
              </Row>
            ))}
          </TableWrap>

          <Button label="אישור והוספה" loading={confirming} onPress={handleConfirm} style={styles.confirmButton} />
        </View>
      )}
    </View>
  );
}

function MacroCell({
  value,
  editable,
  onChange,
}: {
  value: number;
  editable: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <TextInput
      value={String(Math.round(value * 10) / 10)}
      onChangeText={(v) => onChange(Number(v) || 0)}
      keyboardType="decimal-pad"
      textAlign="center"
      editable={editable}
      style={[styles.cellInput, !editable && styles.cellInputDisabled]}
    />
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.ink,
    textAlign: "right",
    marginBottom: 8,
  },
  textarea: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },
  parseRow: {
    flexDirection: "row-reverse",
    marginTop: 8,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.warn,
    marginTop: 8,
    textAlign: "right",
  },
  draftsWrap: {
    marginTop: 16,
    gap: 12,
  },
  nameInput: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 4,
  },
  badge: {
    fontFamily: fonts.sans,
    fontSize: 10,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: "flex-end",
    overflow: "hidden",
  },
  badgeDb: {
    backgroundColor: colors.goodSoft,
    color: colors.good,
  },
  badgeAi: {
    backgroundColor: colors.highlightSoft,
    color: colors.highlight,
  },
  cellInput: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 4,
    textAlign: "center",
  },
  cellInputDisabled: {
    color: colors.inkSoft,
  },
  confirmButton: {
    alignSelf: "flex-start",
  },
});
