"use client";

import { useMemo, useState } from "react";
import { CalendarX2, Search } from "lucide-react";

export type OverviewAppointment = {
  id: string;
  date: string; // ISO date, already formatted YYYY-MM-DD
  startTime: string | null;
  patientName: string;
  doctorName: string;
  type: "SCHEDULED" | "WALK_IN";
  notes: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AppointmentsTable({ appointments }: { appointments: OverviewAppointment[] }) {
  const [tab, setTab] = useState<"all" | "SCHEDULED" | "WALK_IN">("all");
  const [query, setQuery] = useState("");

  const scheduledCount = appointments.filter((a) => a.type === "SCHEDULED").length;
  const walkInCount = appointments.filter((a) => a.type === "WALK_IN").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchesTab = tab === "all" || a.type === tab;
      const matchesQuery =
        !q || a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [appointments, tab, query]);

  const tabs: { key: typeof tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: appointments.length },
    { key: "SCHEDULED", label: "Scheduled", count: scheduledCount },
    { key: "WALK_IN", label: "Walk-in", count: walkInCount },
  ];

  return (
    <div className="bg-paper rounded-xl border border-line shadow-[0_1px_3px_rgba(18,35,61,0.05),0_8px_24px_-16px_rgba(18,35,61,0.12)] overflow-hidden">
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line">
        <h2 className="font-serif text-lg text-ink">Upcoming appointments</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center bg-line/30 rounded-lg p-0.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === t.key ? "bg-paper text-ink shadow-sm" : "text-ink-60 hover:text-ink"
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient or doctor…"
              className="pl-9 pr-3 py-1.5 rounded-lg bg-line/20 text-sm text-ink placeholder:text-ink-50 focus:outline-none focus:bg-paper focus:ring-2 focus:ring-teal-soft transition-colors w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
          <div className="w-12 h-12 rounded-full bg-line/30 flex items-center justify-center text-ink-50 mb-3">
            <CalendarX2 size={22} strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-base text-ink">
            {appointments.length === 0 ? "No upcoming appointments" : "No matches for this filter"}
          </h3>
          <p className="text-sm text-ink-50 mt-1 max-w-xs">
            {appointments.length === 0
              ? "New bookings and walk-ins will appear here automatically."
              : "Try a different search term or tab."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-50 bg-line/10">
                <th className="py-3 px-6 font-normal text-xs uppercase tracking-wide">Date</th>
                <th className="py-3 px-4 font-normal text-xs uppercase tracking-wide">Time</th>
                <th className="py-3 px-4 font-normal text-xs uppercase tracking-wide">Patient</th>
                <th className="py-3 px-4 font-normal text-xs uppercase tracking-wide">Doctor</th>
                <th className="py-3 px-4 font-normal text-xs uppercase tracking-wide">Type</th>
                <th className="py-3 px-6 font-normal text-xs uppercase tracking-wide">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-line/10 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-ink whitespace-nowrap">{a.date}</td>
                  <td className="py-3.5 px-4 font-mono text-ink whitespace-nowrap">{a.startTime ?? "—"}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-ink text-paper text-[11px] font-medium flex items-center justify-center shrink-0">
                        {initials(a.patientName)}
                      </span>
                      <span className="text-ink">{a.patientName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-ink-70">{a.doctorName}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        a.type === "SCHEDULED" ? "bg-teal-soft text-teal" : "bg-amber/10 text-amber"
                      }`}
                    >
                      {a.type === "SCHEDULED" ? "Scheduled" : "Walk-in"}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-ink-50 max-w-xs truncate" title={a.notes ?? ""}>
                    {a.notes ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
