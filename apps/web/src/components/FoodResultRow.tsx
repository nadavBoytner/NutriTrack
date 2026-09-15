"use client";

import { useState } from "react";
import type { FoodItem } from "@foodtrack/shared-types";
import { Button } from "@/components/Button";

type Mode = "g" | "unit";

function macroLine(item: FoodItem): string {
  return `${Math.round(item.caloriesPer100g)} קל' · פ ${Math.round(item.carbsPer100g)} · ש ${Math.round(
    item.fatPer100g,
  )} · ח ${Math.round(item.proteinPer100g)} / 100 גר'`;
}

export function FoodResultRow({
  item,
  disabled,
  onAdd,
}: {
  item: FoodItem;
  disabled: boolean;
  onAdd: (item: FoodItem, quantityG: number) => void;
}) {
  const [mode, setMode] = useState<Mode>("g");
  const [grams, setGrams] = useState(100);
  const [unitCount, setUnitCount] = useState(1);
  const [gramsPerUnit, setGramsPerUnit] = useState(100);

  const quantityG = mode === "g" ? grams : unitCount * gramsPerUnit;

  const modeButtonClass = (m: Mode) =>
    `border-b px-1 pb-0.5 text-xs ${
      mode === m ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
    }`;

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate">{item.name}</p>
        <p className="text-xs tabular-nums text-ink-soft">{macroLine(item)}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded-md bg-paper-raised p-0.5">
          <button type="button" className={modeButtonClass("g")} onClick={() => setMode("g")}>
            גרם
          </button>
          <button type="button" className={modeButtonClass("unit")} onClick={() => setMode("unit")}>
            יחידות
          </button>
        </div>

        {mode === "g" ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              value={grams}
              aria-label="כמות בגרמים"
              onChange={(event) => setGrams(Number(event.target.value))}
              className="w-16 border-0 border-b border-line bg-transparent text-center tabular-nums focus:border-good focus:outline-none"
            />
            <span className="text-xs text-ink-soft">גר&apos;</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              value={unitCount}
              aria-label="מספר יחידות"
              onChange={(event) => setUnitCount(Number(event.target.value))}
              className="w-12 border-0 border-b border-line bg-transparent text-center tabular-nums focus:border-good focus:outline-none"
            />
            <span className="text-xs text-ink-soft">יח&apos; של</span>
            <input
              type="number"
              min={1}
              value={gramsPerUnit}
              aria-label="גרם ליחידה"
              onChange={(event) => setGramsPerUnit(Number(event.target.value))}
              className="w-14 border-0 border-b border-line bg-transparent text-center tabular-nums focus:border-good focus:outline-none"
            />
            <span className="text-xs text-ink-soft">גר&apos;</span>
          </div>
        )}

        <Button type="button" variant="ghost" disabled={disabled} onClick={() => onAdd(item, quantityG)}>
          הוספה
        </Button>
      </div>
    </li>
  );
}
