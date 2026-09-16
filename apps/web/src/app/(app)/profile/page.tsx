import type { Metadata } from "next";
import type { NutritionGoal, Profile } from "@foodtrack/shared-types";
import { NutritionGoalForm } from "@/components/NutritionGoalForm";
import { ProfileForm } from "@/components/ProfileForm";
import { apiFetch } from "@/lib/api";
import { requireToken } from "@/lib/auth";

export const metadata: Metadata = { title: "פרופיל" };

export default async function ProfilePage() {
  const token = await requireToken();

  const [profile, goal] = await Promise.all([
    apiFetch<Profile | null>("/profile", { token }),
    apiFetch<NutritionGoal | null>("/nutrition-goals", { token }),
  ]);

  return (
    <div className="space-y-6">
      <section className="glass-panel p-5 lg:p-6">
        <h1 className="mb-4 font-display text-xl font-bold tracking-tight">פרופיל</h1>
        <ProfileForm profile={profile} />
      </section>

      <section className="glass-panel p-5 lg:p-6">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">יעדי תזונה יומיים</h2>
        <NutritionGoalForm goal={goal} />
      </section>
    </div>
  );
}
