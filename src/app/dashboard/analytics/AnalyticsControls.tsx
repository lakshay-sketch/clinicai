"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw, Download } from "lucide-react";

type DoctorStat = {
  name: string;
  appointmentCount: number;
  noShowCount: number;
  avgRating: number;
  reviewCount: number;
};

export default function AnalyticsControls({ doctorStats }: { doctorStats: DoctorStat[] }) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 500);
  }

  function handleExport() {
    const header = "Doctor,Appointments,No-shows,Avg Rating,Reviews\n";
    const rows = doctorStats
      .map((d) => `${d.name},${d.appointmentCount},${d.noShowCount},${d.reviewCount > 0 ? d.avgRating.toFixed(1) : ""},${d.reviewCount}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinicai-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-paper border border-line-strong text-ink text-xs hover:border-ink transition-colors"
      >
        <Download size={13} strokeWidth={1.75} />
        Export CSV
      </button>
      <button
        onClick={handleRefresh}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-ink text-paper text-xs hover:bg-ink/90 transition-colors"
      >
        <RefreshCw size={13} strokeWidth={1.75} className={refreshing ? "animate-spin" : ""} />
        Refresh
      </button>
    </div>
  );
}
