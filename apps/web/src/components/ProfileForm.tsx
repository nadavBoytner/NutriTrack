"use client";

import { useActionState } from "react";
import type { GoalType, Profile } from "@foodtrack/shared-types";
import { updateProfileAction, type ProfileActionState } from "@/app/actions/profile";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Field";

const GOAL_LABELS: Record<GoalType, string> = {
  cutting: "חיתוך",
  bulking: "מאסה",
  maintain: "שמירה על המשקל",
};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="גיל" htmlFor="age">
          <Input id="age" name="age" type="number" min={0} defaultValue={profile?.age ?? ""} />
        </Field>
        <Field label="גובה (ס&quot;מ)" htmlFor="heightCm">
          <Input id="heightCm" name="heightCm" type="number" min={0} defaultValue={profile?.heightCm ?? ""} />
        </Field>
        <Field label="משקל (ק&quot;ג)" htmlFor="weightKg">
          <Input
            id="weightKg"
            name="weightKg"
            type="number"
            min={0}
            step="0.1"
            defaultValue={profile?.weightKg ?? ""}
          />
        </Field>
        <Field label="מטרה" htmlFor="goalType">
          <Select id="goalType" name="goalType" defaultValue={profile?.goalType ?? ""}>
            <option value="">לא נבחרה</option>
            {(Object.entries(GOAL_LABELS) as [GoalType, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {state?.error && <p className="text-sm text-warn">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "רגע..." : "שמירת פרופיל"}
      </Button>
    </form>
  );
}
