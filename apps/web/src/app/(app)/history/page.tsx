import type { Metadata } from "next";
import { getHistoryAction } from "@/app/actions/log";
import { HistoryList } from "@/components/HistoryList";

export const metadata: Metadata = { title: "היסטוריה" };

export default async function HistoryPage() {
  const initial = await getHistoryAction();

  return (
    <div>
      <h1 className="mb-4 font-display text-xl font-bold tracking-tight">היסטוריה</h1>
      <div className="glass-panel p-5 lg:p-6">
        <HistoryList initial={initial} />
      </div>
    </div>
  );
}
