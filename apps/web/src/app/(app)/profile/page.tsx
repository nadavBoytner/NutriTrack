import type { NutritionGoal, Profile } from "@foodtrack/shared-types";
import { NutritionGoalForm } from "@/components/NutritionGoalForm";
import { ProfileForm } from "@/components/ProfileForm";
import { apiFetch } from "@/lib/api";
import { requireToken } from "@/lib/auth";

export default async function ProfilePage() {
  const token = await requireToken();

  const [profile, goal] = await Promise.all([
    apiFetch<Profile | null>("/profile", { token }),
    apiFetch<NutritionGoal | null>("/nutrition-goals", { token }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-4 font-display text-xl font-medium">פרופיל</h1>
        <ProfileForm profile={profile} />
      </section>

      <section className="border-t border-line pt-8">
        <h2 className="mb-4 font-display text-lg font-medium">יעדי תזונה יומיים</h2>
        <NutritionGoalForm goal={goal} />
      </section>
    </div>
  );
}
