"use client";

import { useState } from "react";
import type { FoodItem } from "@foodtrack/shared-types";
import { Button } from "@/components/Button";

type Mode = "g" | "unit";

function macroLine(item: FoodItem): string {
  return `${Math.round(item.caloriesPer100g)} קל' · פח' ${Math.round(item.carbsPer100g)} · שו ${Math.round(
    item.fatPer100g,
  )} · חל' ${Math.round(item.proteinPer100g)} / 100 גר'`;
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
    <tr className="border-b border-line transition-colors hover:bg-paper-raised/60">
      <td className="max-w-48 py-3 pe-3 align-top">
        <p className="truncate">{item.name}</p>
        <p className="text-xs tabular-nums text-ink-soft">{macroLine(item)}</p>
      </td>
      <td className="py-3 pe-3 align-top">
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </td>
      <td className="py-3 align-top text-end">
        <Button type="button" variant="ghost" disabled={disabled} onClick={() => onAdd(item, quantityG)}>
          הוספה
        </Button>
      </td>
    </tr>
  );
}
