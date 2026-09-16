import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { GoalType, NutritionGoal, Profile } from "@foodtrack/shared-types";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { GlassPanel } from "@/components/GlassPanel";
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

  const [profile, setProfile] = useState<Profile | null>(null);
  const [goal, setGoal] = useState<NutritionGoal | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);

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
    apiFetch<Profile | null>("/profile", { token })
      .then((p) => {
        setProfile(p);
        setEditingProfile(!p);
        if (p) {
          setAge(p.age !== null ? String(p.age) : "");
          setHeightCm(p.heightCm !== null ? String(p.heightCm) : "");
          setWeightKg(p.weightKg !== null ? String(p.weightKg) : "");
          setGoalType(p.goalType);
        }
      })
      .catch((err) => {
        setProfileError(err instanceof ApiError ? err.message : "טעינת הפרופיל נכשלה, נסו שוב");
      });
    apiFetch<NutritionGoal | null>("/nutrition-goals", { token })
      .then((g) => {
        setGoal(g);
        setEditingGoal(!g);
        if (g) {
          setDailyCalories(String(g.dailyCalories));
          setDailyCarbsG(String(g.dailyCarbsG));
          setDailyFatG(String(g.dailyFatG));
          setDailyProteinG(String(g.dailyProteinG));
        }
      })
      .catch((err) => {
        setGoalError(err instanceof ApiError ? err.message : "טעינת היעדים נכשלה, נסו שוב");
      });
  }, [token]);

  function startEditProfile() {
    if (profile) {
      setAge(profile.age !== null ? String(profile.age) : "");
      setHeightCm(profile.heightCm !== null ? String(profile.heightCm) : "");
      setWeightKg(profile.weightKg !== null ? String(profile.weightKg) : "");
      setGoalType(profile.goalType);
    }
    setProfileError(null);
    setEditingProfile(true);
  }

  function startEditGoal() {
    if (goal) {
      setDailyCalories(String(goal.dailyCalories));
      setDailyCarbsG(String(goal.dailyCarbsG));
      setDailyFatG(String(goal.dailyFatG));
      setDailyProteinG(String(goal.dailyProteinG));
    }
    setGoalError(null);
    setEditingGoal(true);
  }

  async function handleSaveProfile() {
    setProfileError(null);
    setProfileSaving(true);
    try {
      const updated = await apiFetch<Profile>("/profile", {
        method: "PUT",
        token,
        body: {
          age: age.trim() ? Number(age) : undefined,
          heightCm: heightCm.trim() ? Number(heightCm) : undefined,
          weightKg: weightKg.trim() ? Number(weightKg) : undefined,
          goalType: goalType ?? undefined,
        },
      });
      setProfile(updated);
      setEditingProfile(false);
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
      const updated = await apiFetch<NutritionGoal>("/nutrition-goals", {
        method: "PUT",
        token,
        body: {
          dailyCalories: Number(dailyCalories),
          dailyCarbsG: Number(dailyCarbsG),
          dailyFatG: Number(dailyFatG),
          dailyProteinG: Number(dailyProteinG),
        },
      });
      setGoal(updated);
      setEditingGoal(false);
    } catch (err) {
      setGoalError(err instanceof ApiError ? err.message : "אירעה שגיאה, נסו שוב");
    } finally {
      setGoalSaving(false);
    }
  }

  return (
    <Screen>
      <GlassPanel>
      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>פרופיל</Text>
        {!editingProfile && (
          <Pressable onPress={startEditProfile}>
            <Text style={styles.editLink}>עריכה</Text>
          </Pressable>
        )}
      </View>

      {editingProfile ? (
        <>
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
          <View style={styles.actionsRow}>
            <Button label="שמירת פרופיל" loading={profileSaving} onPress={handleSaveProfile} />
            {profile && (
              <Pressable
                onPress={() => {
                  setEditingProfile(false);
                  setProfileError(null);
                }}
              >
                <Text style={styles.cancelLink}>ביטול</Text>
              </Pressable>
            )}
          </View>
        </>
      ) : (
        <View style={styles.summary}>
          {profileError && <Text style={styles.error}>{profileError}</Text>}
          <SummaryRow label="גיל" value={profile?.age != null ? String(profile.age) : "—"} />
          <SummaryRow label="גובה" value={profile?.heightCm != null ? `${profile.heightCm} ס"מ` : "—"} />
          <SummaryRow label="משקל" value={profile?.weightKg != null ? `${profile.weightKg} ק"ג` : "—"} />
          <SummaryRow label="מטרה" value={profile?.goalType ? GOAL_LABELS[profile.goalType] : "—"} />
        </View>
      )}
      </GlassPanel>

      <GlassPanel style={styles.panelSpacing}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>יעדי תזונה יומיים</Text>
          {!editingGoal && (
            <Pressable onPress={startEditGoal}>
              <Text style={styles.editLink}>עריכה</Text>
            </Pressable>
          )}
        </View>

        {editingGoal ? (
          <>
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
            <View style={styles.actionsRow}>
              <Button label="שמירת יעדים" loading={goalSaving} onPress={handleSaveGoal} />
              {goal && (
                <Pressable
                  onPress={() => {
                    setEditingGoal(false);
                    setGoalError(null);
                  }}
                >
                  <Text style={styles.cancelLink}>ביטול</Text>
                </Pressable>
              )}
            </View>
          </>
        ) : (
          <View style={styles.summary}>
            {goalError && <Text style={styles.error}>{goalError}</Text>}
            <SummaryRow label="קלוריות ליום" value={goal ? String(goal.dailyCalories) : "—"} />
            <SummaryRow label="פחמימות" value={goal ? `${goal.dailyCarbsG} גר'` : "—"} />
            <SummaryRow label="שומן" value={goal ? `${goal.dailyFatG} גר'` : "—"} />
            <SummaryRow label="חלבון" value={goal ? `${goal.dailyProteinG} גר'` : "—"} />
          </View>
        )}
      </GlassPanel>

      <View style={styles.logoutRow}>
        <Button variant="danger" label="התנתקות" onPress={signOut} />
      </View>
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heading: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.ink,
    textAlign: "right",
  },
  editLink: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.link,
    textDecorationLine: "underline",
  },
  cancelLink: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    textDecorationLine: "underline",
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
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: colors.goodFill,
    borderColor: colors.goodFill,
  },
  chipLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
  },
  chipLabelActive: {
    color: colors.onFill,
    fontFamily: fonts.sansMedium,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.warn,
    marginBottom: 8,
    textAlign: "right",
  },
  actionsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
  },
  summary: {
    gap: 2,
  },
  summaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 10,
  },
  summaryLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
  },
  summaryValue: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ink,
  },
  panelSpacing: {
    marginTop: 16,
  },
  logoutRow: {
    marginTop: 24,
  },
  sectionHeading: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: colors.ink,
    textAlign: "right",
  },
});
