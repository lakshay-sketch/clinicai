"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Doctor = { id: string; name: string; specialization: { name: string } };
type QueueStatus = {
  currentlyServing: { queueNumber: number } | null;
  waiting: { queueNumber: number; position: number; estimatedWaitMinutes: number }[];
};

export default function CheckinWidget({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{ queueNumber: number; doctorId: string } | null>(null);
  const [status, setStatus] = useState<QueueStatus | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!ticket) return;
    const res = await fetch(`/api/queue/${ticket.doctorId}/status`);
    const json = await res.json();
    if (json.success) setStatus(json.data);
  }, [ticket]);

  useEffect(() => {
    if (!ticket) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 6000);
    return () => clearInterval(interval);
  }, [ticket, fetchStatus]);

  async function join(doctorId: string) {
    setJoining(true);
    setError(null);

    const res = await fetch("/api/queue/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId }),
    });

    // Not signed in — send to sign-in, then come straight back to this exact
    // check-in page afterwards, so the patient doesn't lose their place.
    if (res.status === 401) {
      const currentUrl = window.location.pathname;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`);
      return;
    }

    const json = await res.json();
    setJoining(false);

    if (!json.success) {
      setError(json.error?.message ?? "Could not join the queue");
      return;
    }
    setTicket({ queueNumber: json.data.queueNumber, doctorId });
  }

  if (ticket) {
    const myWaitingEntry = status?.waiting.find((w) => w.queueNumber === ticket.queueNumber);
    const peopleAhead = myWaitingEntry ? myWaitingEntry.position - 1 : null;

    return (
      <div className="border border-line p-6 text-center">
        <p className="text-xs text-ink-60">Your ticket number</p>
        <p className="font-mono text-5xl text-ink mt-2">#{ticket.queueNumber}</p>

        {status?.currentlyServing && (
          <p className="text-sm text-ink-60 mt-4">
            Now serving #{status.currentlyServing.queueNumber}
          </p>
        )}

        {peopleAhead !== null && (
          <p className="text-sm text-teal mt-2 font-mono">
            {peopleAhead === 0 ? "You're next" : `${peopleAhead} people ahead of you`}
          </p>
        )}

        {myWaitingEntry && (
          <p className="text-xs text-ink-60 mt-1">
            Estimated wait: {myWaitingEntry.estimatedWaitMinutes} min
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-line border-t border-line">
        {doctors.map((doc) => (
          <div key={doc.id} className="py-4 flex items-center justify-between">
            <div>
              <p className="text-ink text-sm">{doc.name}</p>
              <p className="text-xs text-ink-60">{doc.specialization.name}</p>
            </div>
            <button
              onClick={() => join(doc.id)}
              disabled={joining}
              className="bg-ink text-paper text-sm px-4 py-2 hover:bg-ink/90 disabled:opacity-50"
            >
              {joining ? "Joining…" : "Join queue"}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-red">{error}</p>}
    </div>
  );
}
