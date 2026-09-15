"use server";

import { revalidatePath } from "next/cache";
import type { FoodItem, LogEntry, UpsertWeightEntryInput, WeightEntry } from "@foodtrack/shared-types";
import { apiFetch } from "@/lib/api";
import { requireToken } from "@/lib/auth";

export async function searchFoodItemsAction(query: string): Promise<FoodItem[]> {
  const token = await requireToken();
  if (!query.trim()) return [];
  return apiFetch<FoodItem[]>(`/food-items/search?q=${encodeURIComponent(query)}`, { token });
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

export type ManualEntryActionState = { error?: string } | null;

export async function addManualLogEntryAction(
  _prevState: ManualEntryActionState,
  formData: FormData,
): Promise<ManualEntryActionState> {
  const token = await requireToken();
  const date = String(formData.get("date"));
  const customName = String(formData.get("customName") ?? "").trim();
  const quantityG = Number(formData.get("quantityG"));
  const calories = Number(formData.get("calories"));
  const carbsG = Number(formData.get("carbsG"));
  const fatG = Number(formData.get("fatG"));
  const proteinG = Number(formData.get("proteinG"));

  if (!customName) {
    return { error: "יש להזין שם למאכל" };
  }

  await apiFetch<LogEntry>("/log-entries", {
    method: "POST",
    token,
    body: { date, customName, quantityG, calories, carbsG, fatG, proteinG },
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
