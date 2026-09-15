import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { GoalType, NutritionGoal, Profile } from "@foodtrack/shared-types";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { Screen } from "@/components/Screen";
import { ApiError, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { fonts } from "@/lib/fonts";

const GOAL_LABELS: Record<GoalType, string> = {
  cutting: "חיתוך",
  bulking: "מאסה",
  maintain: "שמירה על המשקל",
};

export default function ProfileScreen() {
  const { token, signOut } = useAuth();

  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [dailyCalories, setDailyCalories] = useState("");
  const [dailyCarbsG, setDailyCarbsG] = useState("");
  const [dailyFatG, setDailyFatG] = useState("");
  const [dailyProteinG, setDailyProteinG] = useState("");
  const [goalError, setGoalError] = useState<string | null>(null);
  const [goalSaving, setGoalSaving] = useState(false);

  useEffect(() => {
    apiFetch<Profile | null>("/profile", { token }).then((profile) => {
      if (!profile) return;
      setAge(profile.age !== null ? String(profile.age) : "");
      setHeightCm(profile.heightCm !== null ? String(profile.heightCm) : "");
      setWeightKg(profile.weightKg !== null ? String(profile.weightKg) : "");
      setGoalType(profile.goalType);
    });
    apiFetch<NutritionGoal | null>("/nutrition-goals", { token }).then((goal) => {
      if (!goal) return;
      setDailyCalories(String(goal.dailyCalories));
      setDailyCarbsG(String(goal.dailyCarbsG));
      setDailyFatG(String(goal.dailyFatG));
      setDailyProteinG(String(goal.dailyProteinG));
    });
  }, [token]);

  async function handleSaveProfile() {
    setProfileError(null);
    setProfileSaving(true);
    try {
      await apiFetch<Profile>("/profile", {
        method: "PUT",
        token,
        body: {
          age: age.trim() ? Number(age) : undefined,
          heightCm: heightCm.trim() ? Number(heightCm) : undefined,
          weightKg: weightKg.trim() ? Number(weightKg) : undefined,
          goalType: goalType ?? undefined,
        },
      });
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "אירעה שגיאה, נסו שוב");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleSaveGoal() {
    setGoalError(null);
    setGoalSaving(true);
    try {
      await apiFetch<NutritionGoal>("/nutrition-goals", {
        method: "PUT",
        token,
        body: {
          dailyCalories: Number(dailyCalories),
          dailyCarbsG: Number(dailyCarbsG),
          dailyFatG: Number(dailyFatG),
          dailyProteinG: Number(dailyProteinG),
        },
      });
    } catch (err) {
      setGoalError(err instanceof ApiError ? err.message : "אירעה שגיאה, נסו שוב");
    } finally {
      setGoalSaving(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.heading}>פרופיל</Text>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Field label="גיל">
            <Input value={age} onChangeText={setAge} keyboardType="number-pad" />
          </Field>
        </View>
        <View style={styles.rowItem}>
          <Field label="גובה (ס&quot;מ)">
            <Input value={heightCm} onChangeText={setHeightCm} keyboardType="number-pad" />
          </Field>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Field label="משקל (ק&quot;ג)">
            <Input value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" />
          </Field>
        </View>
      </View>

      <Field label="מטרה">
        <View style={styles.chips}>
          {(Object.entries(GOAL_LABELS) as [GoalType, string][]).map(([value, label]) => (
            <Pressable
              key={value}
              onPress={() => setGoalType(value)}
              style={[styles.chip, goalType === value && styles.chipActive]}
            >
              <Text style={[styles.chipLabel, goalType === value && styles.chipLabelActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Field>

      {profileError && <Text style={styles.error}>{profileError}</Text>}
      <Button label="שמירת פרופיל" loading={profileSaving} onPress={handleSaveProfile} />

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>יעדי תזונה יומיים</Text>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Field label="קלוריות ליום">
              <Input value={dailyCalories} onChangeText={setDailyCalories} keyboardType="number-pad" />
            </Field>
          </View>
          <View style={styles.rowItem}>
            <Field label="פחמימות (גר')">
              <Input value={dailyCarbsG} onChangeText={setDailyCarbsG} keyboardType="number-pad" />
            </Field>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Field label="שומן (גר')">
              <Input value={dailyFatG} onChangeText={setDailyFatG} keyboardType="number-pad" />
            </Field>
          </View>
          <View style={styles.rowItem}>
            <Field label="חלבון (גר')">
              <Input value={dailyProteinG} onChangeText={setDailyProteinG} keyboardType="number-pad" />
            </Field>
          </View>
        </View>
        {goalError && <Text style={styles.error}>{goalError}</Text>}
        <Button label="שמירת יעדים" loading={goalSaving} onPress={handleSaveGoal} />
      </View>

      <View style={styles.section}>
        <Button variant="danger" label="התנתקות" onPress={signOut} />
      </View>
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
  row: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  chips: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: colors.good,
    borderColor: colors.good,
  },
  chipLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
  },
  chipLabelActive: {
    color: colors.paper,
    fontFamily: fonts.sansMedium,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.warn,
    marginBottom: 8,
    textAlign: "right",
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 20,
    marginTop: 24,
    gap: 4,
  },
  sectionHeading: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.ink,
    textAlign: "right",
    marginBottom: 12,
  },
});
