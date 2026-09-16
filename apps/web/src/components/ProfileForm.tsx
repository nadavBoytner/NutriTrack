"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { GoalType, Profile } from "@foodtrack/shared-types";
import { updateProfileAction, type ProfileActionState } from "@/app/actions/profile";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";

const GOAL_LABELS: Record<GoalType, string> = {
  cutting: "חיתוך",
  bulking: "מאסה",
  maintain: "שמירה על המשקל",
};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(updateProfileAction, null);
  const wasPending = useRef(false);

  const [editing, setEditing] = useState(!profile);
  const [goalType, setGoalType] = useState<GoalType | "">(profile?.goalType ?? "");

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  function startEdit() {
    setGoalType(profile?.goalType ?? "");
    setEditing(true);
  }

  function cancelEdit() {
    setGoalType(profile?.goalType ?? "");
    setEditing(false);
  }

  if (!editing) {
    return (
      <div>
        <SummaryRow label="גיל" value={profile?.age != null ? String(profile.age) : "—"} />
        <SummaryRow label="גובה" value={profile?.heightCm != null ? `${profile.heightCm} ס"מ` : "—"} />
        <SummaryRow label="משקל" value={profile?.weightKg != null ? `${profile.weightKg} ק"ג` : "—"} />
        <SummaryRow label="מטרה" value={profile?.goalType ? GOAL_LABELS[profile.goalType] : "—"} />
        <button
          type="button"
          onClick={startEdit}
          className="mt-3 text-sm text-link underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
        >
          עריכה
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="goalType" value={goalType} />
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
      </div>

      <div>
        <span id="goal-type-label" className="mb-1 block text-sm text-ink-soft">
          מטרה
        </span>
        <div role="group" aria-labelledby="goal-type-label" className="flex flex-wrap gap-2">
          {(Object.entries(GOAL_LABELS) as [GoalType, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={goalType === value}
              onClick={() => setGoalType(value)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight ${
                goalType === value
                  ? "border-good-fill bg-good-fill text-on-fill"
                  : "border-line text-ink hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-warn">{state.error}</p>}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "רגע..." : "שמירת פרופיל"}
        </Button>
        {profile && (
          <button
            type="button"
            onClick={cancelEdit}
            className="text-sm text-ink-soft underline underline-offset-2 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
          >
            ביטול
          </button>
        )}
      </div>
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-2.5 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="font-medium tabular-nums text-ink">{value}</span>
    </div>
  );
}
