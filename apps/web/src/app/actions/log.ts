"use server";

import { revalidatePath } from "next/cache";
import type {
  AiParsedItem,
  FoodItem,
  HistoryPage,
  LogEntry,
  LogEntryUnit,
  UpsertWeightEntryInput,
  WeightEntry,
} from "@foodtrack/shared-types";
import { ApiError, apiFetch } from "@/lib/api";
import { requireToken } from "@/lib/auth";

export async function searchFoodItemsAction(query: string): Promise<FoodItem[]> {
  const token = await requireToken();
  if (!query.trim()) return [];
  return apiFetch<FoodItem[]>(`/food-items/search?q=${encodeURIComponent(query)}`, { token });
}

export async function getHistoryAction(cursor?: string): Promise<HistoryPage> {
  const token = await requireToken();
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiFetch<HistoryPage>(`/log-entries/history${query}`, { token });
}

export async function addFoodLogEntryAction(date: string, foodItemId: string, quantityG: number): Promise<void> {
  const token = await requireToken();
  await apiFetch<LogEntry>("/log-entries", {
    method: "POST",
    token,
    body: { date, foodItemId, quantityG },
  });
  revalidatePath("/");
}

export async function parseMealTextAction(text: string): Promise<{ items?: AiParsedItem[]; error?: string }> {
  const token = await requireToken();
  if (!text.trim()) return { items: [] };
  try {
    const items = await apiFetch<AiParsedItem[]>("/log-entries/ai-parse", {
      method: "POST",
      token,
      body: { text },
    });
    return { items };
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }
}

export async function confirmAiParsedItemAction(date: string, item: AiParsedItem): Promise<void> {
  const token = await requireToken();
  if (item.foodItemId) {
    await apiFetch<LogEntry>("/log-entries", {
      method: "POST",
      token,
      body: { date, foodItemId: item.foodItemId, quantityG: item.quantityG },
    });
  } else {
    await apiFetch<LogEntry>("/log-entries", {
      method: "POST",
      token,
      body: {
        date,
        customName: item.customName,
        source: "ai_estimated",
        quantityG: item.quantityG,
        calories: item.calories,
        carbsG: item.carbsG,
        fatG: item.fatG,
        proteinG: item.proteinG,
      },
    });
  }
  revalidatePath("/");
}

export type ManualEntryActionState = { error?: string } | null;

export async function addManualLogEntryAction(
  _prevState: ManualEntryActionState,
  formData: FormData,
): Promise<ManualEntryActionState> {
  const token = await requireToken();
  const date = String(formData.get("date"));
  const customName = String(formData.get("customName") ?? "").trim();
  const quantityG = Number(formData.get("quantityG"));
  const quantityUnit = (formData.get("quantityUnit") === "portion" ? "portion" : "g") as LogEntryUnit;
  const calories = Number(formData.get("calories"));
  const carbsG = Number(formData.get("carbsG"));
  const fatG = Number(formData.get("fatG"));
  const proteinG = Number(formData.get("proteinG"));

  if (!customName) {
    return { error: "יש להזין שם למאכל" };
  }
  if (!quantityG || Number.isNaN(quantityG)) {
    return { error: quantityUnit === "portion" ? "יש להזין מספר מנות" : "יש להזין כמות בגרמים" };
  }

  await apiFetch<LogEntry>("/log-entries", {
    method: "POST",
    token,
    body: { date, customName, quantityG, quantityUnit, calories, carbsG, fatG, proteinG },
  });
  revalidatePath("/");
  return null;
}

export async function deleteLogEntryAction(id: string): Promise<void> {
  const token = await requireToken();
  await apiFetch<void>(`/log-entries/${id}`, { method: "DELETE", token });
  revalidatePath("/");
}

export async function upsertWeightEntryAction(input: UpsertWeightEntryInput): Promise<WeightEntry> {
  const token = await requireToken();
  const entry = await apiFetch<WeightEntry>("/weight-entries", { method: "PUT", token, body: input });
  revalidatePath("/");
  return entry;
}
