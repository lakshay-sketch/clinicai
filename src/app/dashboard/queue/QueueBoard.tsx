"use client";

import { useState, useEffect, useCallback } from "react";

type Doctor = { id: string; name: string };
type QueueStatus = {
  doctorId: string;
  currentlyServing: { queueNumber: number; patientName: string } | null;
  waiting: { queueEntryId: string; queueNumber: number; position: number; estimatedWaitMinutes: number }[];
};

export default function QueueBoard({ doctors }: { doctors: Doctor[] }) {
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]?.id ?? "");
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!selectedDoctor) return;
    const res = await fetch(`/api/queue/${selectedDoctor}/status`);
    const json = await res.json();
    if (json.success) setStatus(json.data);
  }, [selectedDoctor]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  async function performAction(entryId: string, action: "call" | "skip" | "complete") {
    setActionLoading(entryId + action);
    await fetch(`/api/queue/${entryId}/${action}`, { method: "POST" });
    await fetchStatus();
    setActionLoading(null);
  }

  if (doctors.length === 0) {
    return <p className="text-sm text-ink-60">No active doctors to show a queue for.</p>;
  }

  return (
    <div>
      <div className="flex gap-2 border-b border-line pb-3">
        {doctors.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDoctor(d.id)}
            className={`px-3 py-1.5 text-sm border ${
              selectedDoctor === d.id
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-60 hover:text-ink"
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {status && (
        <div className="mt-6">
          <div className="border border-line p-4">
            <p className="text-xs text-ink-60">Currently serving</p>
            {status.currentlyServing ? (
              <p className="font-mono text-lg text-teal mt-1">
                #{status.currentlyServing.queueNumber} — {status.currentlyServing.patientName}
              </p>
            ) : (
              <p className="text-sm text-ink-60 mt-1">No one currently in consultation</p>
            )}
          </div>

          <table className="mt-6 w-full text-sm border-t border-line">
            <thead>
              <tr className="text-left text-ink-60">
                <th className="py-2 pr-4 font-normal">Ticket</th>
                <th className="py-2 pr-4 font-normal">Wait est.</th>
                <th className="py-2 pr-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {status.waiting.map((entry) => (
                <tr key={entry.queueEntryId} className="border-t border-line">
                  <td className="py-3 pr-4 font-mono text-ink">#{entry.queueNumber}</td>
                  <td className="py-3 pr-4 text-ink-60">{entry.estimatedWaitMinutes} min</td>
                  <td className="py-3 pr-4 flex gap-2">
                    <button
                      onClick={() => performAction(entry.queueEntryId, "call")}
                      disabled={actionLoading === entry.queueEntryId + "call"}
                      className="text-teal hover:underline disabled:opacity-50"
                    >
                      Call
                    </button>
                    <button
                      onClick={() => performAction(entry.queueEntryId, "skip")}
                      disabled={actionLoading === entry.queueEntryId + "skip"}
                      className="text-amber hover:underline disabled:opacity-50"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => performAction(entry.queueEntryId, "complete")}
                      disabled={actionLoading === entry.queueEntryId + "complete"}
                      className="text-ink-60 hover:underline disabled:opacity-50"
                    >
                      Complete
                    </button>
                  </td>
                </tr>
              ))}
              {status.waiting.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-ink-60">
                    No one waiting right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
