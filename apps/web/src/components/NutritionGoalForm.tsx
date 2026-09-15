"use client";

import { useActionState } from "react";
import type { NutritionGoal } from "@foodtrack/shared-types";
import { updateNutritionGoalAction, type ProfileActionState } from "@/app/actions/profile";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";

export function NutritionGoalForm({ goal }: { goal: NutritionGoal | null }) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateNutritionGoalAction,
    null,
  );

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
      <Button type="submit" disabled={pending}>
        {pending ? "רגע..." : "שמירת יעדים"}
      </Button>
    </form>
  );
}
