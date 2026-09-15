"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import type { AiParsedItem } from "@foodtrack/shared-types";
import { confirmAiParsedItemAction, parseMealTextAction } from "@/app/actions/log";
import { Button } from "@/components/Button";

interface Rate {
  calories: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
}

interface DraftItem extends AiParsedItem {
  key: string;
  ratePerG?: Rate;
}

function toDraft(item: AiParsedItem): DraftItem {
  const ratePerG =
    item.source === "db" && item.quantityG > 0
      ? {
          calories: item.calories / item.quantityG,
          carbsG: item.carbsG / item.quantityG,
          fatG: item.fatG / item.quantityG,
          proteinG: item.proteinG / item.quantityG,
        }
      : undefined;
  return { ...item, key: crypto.randomUUID(), ratePerG };
}

export function AiMealParser({ date }: { date: string }) {
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleParse() {
    if (!text.trim() || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await parseMealTextAction(text);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDrafts((result.items ?? []).map(toDraft));
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleParse();
    }
  }

  function updateDraft(key: string, patch: Partial<DraftItem>) {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function handleQuantityChange(item: DraftItem, quantityG: number) {
    if (item.ratePerG) {
      updateDraft(item.key, {
        quantityG,
        calories: item.ratePerG.calories * quantityG,
        carbsG: item.ratePerG.carbsG * quantityG,
        fatG: item.ratePerG.fatG * quantityG,
        proteinG: item.ratePerG.proteinG * quantityG,
      });
    } else {
      updateDraft(item.key, { quantityG });
    }
  }

  function removeDraft(key: string) {
    setDrafts((prev) => prev.filter((d) => d.key !== key));
  }

  function handleConfirm() {
    startTransition(async () => {
      await Promise.all(drafts.map((item) => confirmAiParsedItemAction(date, item)));
      setDrafts([]);
      setText("");
    });
  }

  return (
    <div className="mt-6 border-t border-line pt-6">
      <h2 className="mb-2 font-display text-lg font-medium">מה אכלת?</h2>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ספר/י בחופשיות, למשל: אכלתי סלט עוף וכוס אורז (Enter לשליחה, Shift+Enter לשורה חדשה)"
        rows={2}
        className="w-full resize-none border-0 border-b border-line bg-transparent py-2 text-base focus:border-good focus:outline-none"
      />
      <div className="mt-2 flex justify-end">
        <Button type="button" variant="ghost" disabled={isPending || !text.trim()} onClick={handleParse}>
          {isPending && drafts.length === 0 ? "מפרק..." : "פירוק עם AI"}
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-warn">{error}</p>}

      {drafts.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="overflow-x-auto border-y border-line">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-ink text-xs text-ink-soft">
                  <th className="py-2 text-start font-normal">מאכל</th>
                  <th className="py-2 text-start font-normal">כמות</th>
                  <th className="py-2 text-start font-normal">קל&apos;</th>
                  <th className="py-2 text-start font-normal">פח&apos;</th>
                  <th className="py-2 text-start font-normal">שו</th>
                  <th className="py-2 text-start font-normal">חל&apos;</th>
                  <th className="py-2" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {drafts.map((item) => (
                  <tr key={item.key} className="border-b border-line last:border-b-0">
                    <td className="max-w-40 py-2.5 pe-2 align-top">
                      <input
                        value={item.customName}
                        onChange={(event) => updateDraft(item.key, { customName: event.target.value })}
                        className="w-full border-0 border-b border-line bg-transparent focus:border-good focus:outline-none"
                      />
                      <span
                        className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[11px] ${
                          item.source === "db" ? "bg-good-soft text-good" : "bg-highlight-soft text-highlight"
                        }`}
                      >
                        {item.source === "db" ? "מהמאגר" : "הערכת AI"}
                      </span>
                    </td>

                    <td className="py-2.5 pe-2 align-top">
                      <input
                        type="number"
                        min={1}
                        value={Math.round(item.quantityG)}
                        onChange={(event) => handleQuantityChange(item, Number(event.target.value))}
                        className="w-16 border-0 border-b border-line bg-transparent text-center tabular-nums focus:border-good focus:outline-none"
                      />
                    </td>

                    <td className="py-2.5 pe-2 align-top">
                      <MacroInput
                        value={item.calories}
                        disabled={item.source === "db"}
                        onChange={(value) => updateDraft(item.key, { calories: value })}
                      />
                    </td>
                    <td className="py-2.5 pe-2 align-top">
                      <MacroInput
                        value={item.carbsG}
                        disabled={item.source === "db"}
                        onChange={(value) => updateDraft(item.key, { carbsG: value })}
                      />
                    </td>
                    <td className="py-2.5 pe-2 align-top">
                      <MacroInput
                        value={item.fatG}
                        disabled={item.source === "db"}
                        onChange={(value) => updateDraft(item.key, { fatG: value })}
                      />
                    </td>
                    <td className="py-2.5 pe-2 align-top">
                      <MacroInput
                        value={item.proteinG}
                        disabled={item.source === "db"}
                        onChange={(value) => updateDraft(item.key, { proteinG: value })}
                      />
                    </td>

                    <td className="py-2.5 align-top text-end">
                      <button
                        type="button"
                        aria-label="הסרה"
                        onClick={() => removeDraft(item.key)}
                        className="rounded px-1.5 py-0.5 text-ink-soft transition-colors hover:bg-warn-soft hover:text-warn"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button type="button" disabled={isPending} onClick={handleConfirm}>
            {isPending ? "מוסיף..." : "אישור והוספה"}
          </Button>
        </div>
      )}
    </div>
  );
}

function MacroInput({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      step="0.1"
      value={Math.round(value * 10) / 10}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-14 border-0 border-b border-line bg-transparent text-center tabular-nums focus:border-good focus:outline-none disabled:text-ink-soft"
    />
  );
}
