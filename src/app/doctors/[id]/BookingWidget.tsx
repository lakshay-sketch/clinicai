"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const SYMPTOM_NOTES_KEY = "clinicai_symptom_notes";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingWidget({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function loadSlots() {
    setLoadingSlots(true);
    setSlots(null);
    setResult(null);
    const res = await fetch(`/api/doctors/${doctorId}/availability?date=${date}`);
    const json = await res.json();
    setLoadingSlots(false);
    if (json.success) setSlots(json.data.slots);
  }

  async function book(startTime: string) {
    setBooking(true);
    setResult(null);

    let notes: string | undefined;
    try {
      notes = localStorage.getItem(SYMPTOM_NOTES_KEY) ?? undefined;
    } catch {}

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date, startTime, notes }),
    });

    if (res.status === 401) {
      const currentUrl = window.location.pathname;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`);
      return;
    }

    const json = await res.json();
    setBooking(false);

    if (json.success) {
      setResult({ success: true, message: `Booked for ${date} at ${startTime}.` });
      setSlots(null);
      try {
        localStorage.removeItem(SYMPTOM_NOTES_KEY);
      } catch {}
    } else {
      setResult({ success: false, message: json.error?.message ?? "Booking failed" });
      loadSlots();
    }
  }

  return (
    <div>
      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-xs text-ink-50 mb-1.5">Date</label>
          <Input
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => { setDate(e.target.value); setSlots(null); setResult(null); }}
          />
        </div>
        <Button variant="secondary" onClick={loadSlots} disabled={loadingSlots}>
          {loadingSlots ? "Checking…" : "Check availability"}
        </Button>
      </div>

      {slots && (
        <div className="mt-6">
          {slots.length === 0 ? (
            <p className="text-sm text-ink-70">No slots available on this date.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => book(s)}
                  disabled={booking}
                  className="h-10 px-3 border border-line-strong text-sm font-mono text-ink hover:border-teal hover:text-teal disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {result && (
        <p className={`mt-5 text-sm ${result.success ? "text-teal" : "text-red"}`}>{result.message}</p>
      )}
    </div>
  );
}
