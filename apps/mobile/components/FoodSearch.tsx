import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { FoodItem } from "@foodtrack/shared-types";
import { Button } from "@/components/Button";
import { Input } from "@/components/Field";
import { Cell, COL, HeaderCell, HeaderRow, Row, TableWrap } from "@/components/Table";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

const QTY_COL = 130;

export function FoodSearch({ date, onAdded }: { date: string; onAdded: () => void }) {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setError(null);
    setSearching(true);
    try {
      const items = await apiFetch<FoodItem[]>(`/food-items/search?q=${encodeURIComponent(query)}`, { token });
      setResults(items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "החיפוש נכשל, נסו שוב");
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(item: FoodItem, quantityG: number) {
    setAddingId(item.id);
    try {
      await apiFetch("/log-entries", { method: "POST", token, body: { date, foodItemId: item.id, quantityG } });
      setResults((prev) => prev.filter((r) => r.id !== item.id));
      onAdded();
    } finally {
      setAddingId(null);
    }
  }

  return (
    <View>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="חיפוש מזון, למשל: אורז"
          placeholderTextColor={colors.inkSoft + "99"}
          textAlign="right"
          style={styles.searchInput}
          onSubmitEditing={handleSearch}
        />
        <Button variant="ghost" label="חיפוש" loading={searching} onPress={handleSearch} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {results.length > 0 && (
        <TableWrap>
          <HeaderRow>
            <HeaderCell width={COL.name}>מאכל</HeaderCell>
            <HeaderCell width={QTY_COL}>כמות</HeaderCell>
            <HeaderCell width={COL.action + 30}> </HeaderCell>
          </HeaderRow>
          {results.map((item) => (
            <FoodResultRow key={item.id} item={item} adding={addingId === item.id} onAdd={handleAdd} />
          ))}
        </TableWrap>
      )}
    </View>
  );
}

function FoodResultRow({
  item,
  adding,
  onAdd,
}: {
  item: FoodItem;
  adding: boolean;
  onAdd: (item: FoodItem, quantityG: number) => void;
}) {
  const [grams, setGrams] = useState("100");

  return (
    <Row>
      <Cell width={COL.name}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.macroLine}>
          {Math.round(item.caloriesPer100g)} קל&apos; · פח&apos; {Math.round(item.carbsPer100g)} · שו{" "}
          {Math.round(item.fatPer100g)} · חל&apos; {Math.round(item.proteinPer100g)} / 100 גר&apos;
        </Text>
      </Cell>
      <Cell width={QTY_COL} style={styles.qtyCell}>
        <TextInput
          value={grams}
          onChangeText={setGrams}
          keyboardType="number-pad"
          textAlign="center"
          style={styles.qtyInput}
        />
        <Text style={styles.unit}>גר&apos;</Text>
      </Cell>
      <Cell width={COL.action + 30}>
        <Button variant="ghost" label="הוספה" loading={adding} onPress={() => onAdd(item, Number(grams) || 100)} />
      </Cell>
    </Row>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row-reverse",
    gap: 8,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 8,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.warn,
    marginTop: 8,
    textAlign: "right",
  },
  name: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    textAlign: "right",
  },
  macroLine: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: "right",
  },
  qtyCell: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  qtyInput: {
    width: 50,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 4,
  },
  unit: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkSoft,
  },
});
