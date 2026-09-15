"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { LogEntry, LogEntryUnit } from "@foodtrack/shared-types";
import { addManualLogEntryAction, type ManualEntryActionState } from "@/app/actions/log";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";

type Mode = "per100g" | "perPortion";

const EMPTY_PER_UNIT = { calories: "", carbsG: "", fatG: "", proteinG: "" };

function perUnitFromEntry(entry: LogEntry, mode: Mode) {
  const factor = mode === "perPortion" ? entry.quantityG : entry.quantityG / 100;
  if (!factor) return EMPTY_PER_UNIT;
  return {
    calories: round(entry.calories / factor),
    carbsG: round(entry.carbsG / factor),
    fatG: round(entry.fatG / factor),
    proteinG: round(entry.proteinG / factor),
  };
}

function round(value: number): string {
  return (Math.round(value * 10) / 10).toString();
}

export function ManualEntryForm({ date, recentFoods }: { date: string; recentFoods: LogEntry[] }) {
  const [state, formAction, pending] = useActionState<ManualEntryActionState, FormData>(
    addManualLogEntryAction,
    null,
  );
  const wasPending = useRef(false);

  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("per100g");
  const [amount, setAmount] = useState("100");
  const [perUnit, setPerUnit] = useState(EMPTY_PER_UNIT);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setName("");
      setMode("per100g");
      setAmount("100");
      setPerUnit(EMPTY_PER_UNIT);
    }
    wasPending.current = pending;
  }, [pending, state]);

  function applyRecentFood(entry: LogEntry) {
    const nextMode: Mode = entry.quantityUnit === "portion" ? "perPortion" : "per100g";
    setName(entry.customName ?? "");
    setMode(nextMode);
    setAmount(entry.quantityG.toString());
    setPerUnit(perUnitFromEntry(entry, nextMode));
  }

  const amountNum = Number(amount) || 0;
  const factor = mode === "perPortion" ? amountNum : amountNum / 100;
  const calories = (Number(perUnit.calories) || 0) * factor;
  const carbsG = (Number(perUnit.carbsG) || 0) * factor;
  const fatG = (Number(perUnit.fatG) || 0) * factor;
  const proteinG = (Number(perUnit.proteinG) || 0) * factor;
  const quantityUnit: LogEntryUnit = mode === "perPortion" ? "portion" : "g";

  const modeButtonClass = (m: Mode) =>
    `border-b px-2 pb-1 text-sm ${
      mode === m ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
    }`;

  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm text-ink-soft hover:text-ink">הוספה ידנית</summary>

      {recentFoods.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm text-ink-soft">מזונות שהוספתי לאחרונה</p>
          <div className="flex flex-wrap gap-2">
            {recentFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => applyRecentFood(food)}
                className="rounded-md border border-line px-2.5 py-1 text-sm text-ink hover:bg-paper-raised"
              >
                {food.customName}
              </button>
            ))}
          </div>
        </div>
      )}

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="quantityG" value={amountNum} />
        <input type="hidden" name="quantityUnit" value={quantityUnit} />
        <input type="hidden" name="calories" value={calories} />
        <input type="hidden" name="carbsG" value={carbsG} />
        <input type="hidden" name="fatG" value={fatG} />
        <input type="hidden" name="proteinG" value={proteinG} />

        <Field label="שם המאכל" htmlFor="customName">
          <Input id="customName" name="customName" value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>

        <div className="flex gap-2">
          <button
            type="button"
            className={modeButtonClass("per100g")}
            onClick={() => {
              setMode("per100g");
              setAmount("100");
            }}
          >
            לפי 100 גרם
          </button>
          <button
            type="button"
            className={modeButtonClass("perPortion")}
            onClick={() => {
              setMode("perPortion");
              setAmount("1");
            }}
          >
            לפי מנה
          </button>
        </div>

        <Field label={mode === "perPortion" ? "מספר מנות" : "כמות (גר')"} htmlFor="amount">
          <Input
            id="amount"
            type="number"
            min={0}
            step={mode === "perPortion" ? "0.5" : "1"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={mode === "perPortion" ? "קלוריות למנה" : "קלוריות ל-100 גר'"} htmlFor="perCalories">
            <Input
              id="perCalories"
              type="number"
              min={0}
              step="0.1"
              value={perUnit.calories}
              onChange={(e) => setPerUnit((p) => ({ ...p, calories: e.target.value }))}
              required
            />
          </Field>
          <Field label={mode === "perPortion" ? "פחמימות למנה (גר')" : "פחמימות ל-100 גר'"} htmlFor="perCarbs">
            <Input
              id="perCarbs"
              type="number"
              min={0}
              step="0.1"
              value={perUnit.carbsG}
              onChange={(e) => setPerUnit((p) => ({ ...p, carbsG: e.target.value }))}
              required
            />
          </Field>
          <Field label={mode === "perPortion" ? "שומן למנה (גר')" : "שומן ל-100 גר'"} htmlFor="perFat">
            <Input
              id="perFat"
              type="number"
              min={0}
              step="0.1"
              value={perUnit.fatG}
              onChange={(e) => setPerUnit((p) => ({ ...p, fatG: e.target.value }))}
              required
            />
          </Field>
          <Field label={mode === "perPortion" ? "חלבון למנה (גר')" : "חלבון ל-100 גר'"} htmlFor="perProtein">
            <Input
              id="perProtein"
              type="number"
              min={0}
              step="0.1"
              value={perUnit.proteinG}
              onChange={(e) => setPerUnit((p) => ({ ...p, proteinG: e.target.value }))}
              required
            />
          </Field>
        </div>

        <p className="text-sm tabular-nums text-ink-soft">
          סה&quot;כ: {Math.round(calories)} קל&apos; · פח&apos; {Math.round(carbsG)} · שו {Math.round(fatG)} · חל&apos;{" "}
          {Math.round(proteinG)}
        </p>

        {state?.error && <p className="text-sm text-warn">{state.error}</p>}
        <Button type="submit" variant="ghost" disabled={pending}>
          {pending ? "רגע..." : "הוספה לרשימה"}
        </Button>
      </form>
    </details>
  );
}
