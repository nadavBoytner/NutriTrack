"use server";

import { revalidatePath } from "next/cache";
import type { GoalType, NutritionGoal, Profile } from "@foodtrack/shared-types";
import { ApiError, apiFetch } from "@/lib/api";
import { requireToken } from "@/lib/auth";

export type ProfileActionState = { error?: string } | null;

function numberOrUndefined(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  return Number(value);
}

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const token = await requireToken();
  const goalType = formData.get("goalType");

  try {
    await apiFetch<Profile>("/profile", {
      method: "PUT",
      token,
      body: {
        age: numberOrUndefined(formData.get("age")),
        heightCm: numberOrUndefined(formData.get("heightCm")),
        weightKg: numberOrUndefined(formData.get("weightKg")),
        goalType: typeof goalType === "string" && goalType ? (goalType as GoalType) : undefined,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }

  revalidatePath("/profile");
  revalidatePath("/");
  return null;
}

export async function updateNutritionGoalAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const token = await requireToken();

  try {
    await apiFetch<NutritionGoal>("/nutrition-goals", {
      method: "PUT",
      token,
      body: {
        dailyCalories: Number(formData.get("dailyCalories")),
        dailyCarbsG: Number(formData.get("dailyCarbsG")),
        dailyFatG: Number(formData.get("dailyFatG")),
        dailyProteinG: Number(formData.get("dailyProteinG")),
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }

  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath("/reports");
  return null;
}
