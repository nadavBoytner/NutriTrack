import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Field";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

export function WeighInForm({
  date,
  initialWeightKg,
  onSaved,
}: {
  date: string;
  initialWeightKg: number | null;
  onSaved: () => void;
}) {
  const { token } = useAuth();
  const [value, setValue] = useState(initialWeightKg !== null ? String(initialWeightKg) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    const weightKg = Number(value);
    if (!weightKg || weightKg <= 0) return;
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch("/weight-entries", { method: "PUT", token, body: { date, weightKg } });
      setSaved(true);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>משקל היום</Text>
      <Input
        value={value}
        onChangeText={(text) => {
          setValue(text);
          setSaved(false);
        }}
        keyboardType="decimal-pad"
        placeholder={'ק"ג'}
        style={styles.input}
      />
      <Text style={styles.unit}>{'ק"ג'}</Text>
      <Button
        variant="ghost"
        label={saved ? "נשמר" : "שמירה"}
        loading={saving}
        onPress={handleSave}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.inkSoft,
  },
  input: {
    width: 70,
    marginBottom: 0,
    textAlign: "center",
  },
  unit: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
  },
  button: {
    marginRight: "auto",
  },
});
