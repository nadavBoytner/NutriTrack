"use client";

import { useState, useTransition } from "react";
import { upsertWeightEntryAction } from "@/app/actions/log";
import { Button } from "@/components/Button";

export function WeighInForm({ date, initialWeightKg }: { date: string; initialWeightKg: number | null }) {
  const [value, setValue] = useState(initialWeightKg !== null ? String(initialWeightKg) : "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const weightKg = Number(value);
    if (!weightKg || weightKg <= 0) return;
    setSaved(false);
    startTransition(async () => {
      await upsertWeightEntryAction({ date, weightKg });
      setSaved(true);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-ink-soft">משקל היום</span>
      <input
        type="number"
        min={0}
        step="0.1"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSaved(false);
        }}
        placeholder="ק&quot;ג"
        className="w-20 border-0 border-b border-line bg-transparent tabular-nums focus:border-good focus:outline-none"
      />
      <span className="text-sm text-ink-soft">ק&quot;ג</span>
      <Button type="button" variant="ghost" disabled={isPending} onClick={handleSave}>
        {saved ? "נשמר" : "שמירה"}
      </Button>
    </div>
  );
}
