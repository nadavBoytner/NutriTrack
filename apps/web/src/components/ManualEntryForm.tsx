"use client";

import { useActionState } from "react";
import { addManualLogEntryAction, type ManualEntryActionState } from "@/app/actions/log";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";

export function ManualEntryForm({ date }: { date: string }) {
  const [state, formAction, pending] = useActionState<ManualEntryActionState, FormData>(
    addManualLogEntryAction,
    null,
  );

  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm text-ink-soft hover:text-ink">הוספה ידנית</summary>
      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="date" value={date} />
        <Field label="שם המאכל" htmlFor="customName">
          <Input id="customName" name="customName" required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="כמות (גר')" htmlFor="quantityG">
            <Input id="quantityG" name="quantityG" type="number" min={1} defaultValue={100} required />
          </Field>
          <Field label="קלוריות" htmlFor="calories">
            <Input id="calories" name="calories" type="number" min={0} step="0.1" required />
          </Field>
          <Field label="פחמימות (גר')" htmlFor="carbsG">
            <Input id="carbsG" name="carbsG" type="number" min={0} step="0.1" required />
          </Field>
          <Field label="שומן (גר')" htmlFor="fatG">
            <Input id="fatG" name="fatG" type="number" min={0} step="0.1" required />
          </Field>
          <Field label="חלבון (גר')" htmlFor="proteinG">
            <Input id="proteinG" name="proteinG" type="number" min={0} step="0.1" required />
          </Field>
        </div>
        {state?.error && <p className="text-sm text-warn">{state.error}</p>}
        <Button type="submit" variant="ghost" disabled={pending}>
          {pending ? "רגע..." : "הוספה לרשימה"}
        </Button>
      </form>
    </details>
  );
}
