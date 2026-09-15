export type GoalType = "cutting" | "bulking" | "maintain";

export interface AuthResponse {
  accessToken: string;
}

export interface Profile {
  userId: string;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goalType: GoalType | null;
}

export interface UpdateProfileInput {
  age?: number;
  heightCm?: number;
  weightKg?: number;
  goalType?: GoalType;
}

export interface NutritionGoal {
  userId: string;
  dailyCalories: number;
  dailyCarbsG: number;
  dailyFatG: number;
  dailyProteinG: number;
}

export interface UpdateNutritionGoalInput {
  dailyCalories: number;
  dailyCarbsG: number;
  dailyFatG: number;
  dailyProteinG: number;
}

export interface FoodItem {
  id: string;
  externalId: string;
  name: string;
  caloriesPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  proteinPer100g: number;
  barcode: string | null;
}

export type LogEntrySource = "db" | "manual";
export type LogEntryUnit = "g" | "portion";

export interface LogEntry {
  id: string;
  userId: string;
  date: string;
  foodItemId: string | null;
  foodItem: { name: string } | null;
  customName: string | null;
  quantityG: number;
  quantityUnit: LogEntryUnit;
  calories: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
  source: LogEntrySource;
}

export interface CreateLogEntryInput {
  date: string;
  quantityG: number;
  quantityUnit?: LogEntryUnit;
  foodItemId?: string;
  customName?: string;
  calories?: number;
  carbsG?: number;
  fatG?: number;
  proteinG?: number;
}

export interface UpdateLogEntryInput {
  quantityG?: number;
  calories?: number;
  carbsG?: number;
  fatG?: number;
  proteinG?: number;
}

export interface WeightEntry {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
}

export interface UpsertWeightEntryInput {
  date: string;
  weightKg: number;
}

export type ReportPeriod = "daily" | "weekly" | "monthly";

export interface MacroTotals {
  calories: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
}

export interface MacroReport {
  period: ReportPeriod;
  from: string;
  to: string;
  totals: MacroTotals;
  goal: MacroTotals | null;
}
