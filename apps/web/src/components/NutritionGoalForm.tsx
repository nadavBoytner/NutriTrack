"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { NutritionGoal } from "@foodtrack/shared-types";
import { updateNutritionGoalAction, type ProfileActionState } from "@/app/actions/profile";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";

export function NutritionGoalForm({ goal }: { goal: NutritionGoal | null }) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateNutritionGoalAction,
    null,
  );
  const wasPending = useRef(false);
  const [editing, setEditing] = useState(!goal);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  if (!editing) {
    return (
      <div>
        <SummaryRow label="קלוריות ליום" value={goal ? String(goal.dailyCalories) : "—"} />
        <SummaryRow label="פחמימות" value={goal ? `${goal.dailyCarbsG} גר'` : "—"} />
        <SummaryRow label="שומן" value={goal ? `${goal.dailyFatG} גר'` : "—"} />
        <SummaryRow label="חלבון" value={goal ? `${goal.dailyProteinG} גר'` : "—"} />
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 text-sm text-link underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
        >
          עריכה
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="קלוריות ליום" htmlFor="dailyCalories">
          <Input
            id="dailyCalories"
            name="dailyCalories"
            type="number"
            min={0}
            required
            defaultValue={goal?.dailyCalories ?? ""}
          />
        </Field>
        <Field label="פחמימות (גר')" htmlFor="dailyCarbsG">
          <Input
            id="dailyCarbsG"
            name="dailyCarbsG"
            type="number"
            min={0}
            required
            defaultValue={goal?.dailyCarbsG ?? ""}
          />
        </Field>
        <Field label="שומן (גר')" htmlFor="dailyFatG">
          <Input id="dailyFatG" name="dailyFatG" type="number" min={0} required defaultValue={goal?.dailyFatG ?? ""} />
        </Field>
        <Field label="חלבון (גר')" htmlFor="dailyProteinG">
          <Input
            id="dailyProteinG"
            name="dailyProteinG"
            type="number"
            min={0}
            required
            defaultValue={goal?.dailyProteinG ?? ""}
          />
        </Field>
      </div>
      {state?.error && <p className="text-sm text-warn">{state.error}</p>}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "רגע..." : "שמירת יעדים"}
        </Button>
        {goal && (
          <button
            type="button"
            onClick={() => setEditing(false)}
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
