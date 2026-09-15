"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { FoodItem } from "@foodtrack/shared-types";
import { addFoodLogEntryAction, searchFoodItemsAction } from "@/app/actions/log";
import { Button } from "@/components/Button";
import { FoodResultRow } from "@/components/FoodResultRow";
import { Input } from "@/components/Field";

export function FoodSearch({ date }: { date: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        setResults(await searchFoodItemsAction(query));
      } catch {
        setError("החיפוש נכשל, נסו שוב");
      }
    });
  }

  function handleAdd(item: FoodItem, quantityG: number) {
    startTransition(async () => {
      await addFoodLogEntryAction(date, item.id, quantityG);
      setResults((prev) => prev.filter((r) => r.id !== item.id));
    });
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="חיפוש מזון, למשל: אורז"
        />
        <Button type="submit" variant="ghost" disabled={isPending}>
          חיפוש
        </Button>
      </form>

      {error && <p className="mt-2 text-sm text-warn">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-3 max-h-96 divide-y divide-line overflow-y-auto border-y border-line">
          {results.map((item) => (
            <FoodResultRow key={item.id} item={item} disabled={isPending} onAdd={handleAdd} />
          ))}
        </ul>
      )}
    </div>
  );
}
