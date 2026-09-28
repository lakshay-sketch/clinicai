"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sunrise, Sun, Sunset, CalendarX2, CheckCircle2, Loader2 } from "lucide-react";

const SYMPTOM_NOTES_KEY = "clinicai_symptom_notes";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function next14Days() {
  const days: { iso: string; weekday: string; day: number; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      iso: isoDate(d),
      weekday: d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase(),
      day: d.getDate(),
      isToday: i === 0,
    });
  }
  return days;
}

function groupSlots(slots: string[]) {
  const groups: { label: string; icon: typeof Sunrise; items: string[] }[] = [
    { label: "Morning", icon: Sunrise, items: [] },
    { label: "Afternoon", icon: Sun, items: [] },
    { label: "Evening", icon: Sunset, items: [] },
  ];
  for (const s of slots) {
    const hour = parseInt(s.split(":")[0], 10);
    if (hour < 12) groups[0].items.push(s);
    else if (hour < 17) groups[1].items.push(s);
    else groups[2].items.push(s);
  }
  return groups.filter((g) => g.items.length > 0);
}

function formatTime12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load payment script"));
    document.body.appendChild(script);
  });
}

export default function BookingWidget({
  doctorId,
  doctorName,
  consultationFee,
}: {
  doctorId: string;
  doctorName: string;
  consultationFee: number;
}) {
  const router = useRouter();
  const days = next14Days();
  const [date, setDate] = useState(days[0].iso);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasNotes, setHasNotes] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [payState, setPayState] = useState<"idle" | "loading" | "paid" | "error">("idle");
  const [payMessage, setPayMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      setHasNotes(!!localStorage.getItem(SYMPTOM_NOTES_KEY));
    } catch {}
  }, []);

  useEffect(() => {
    loadSlots(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function loadSlots(d: string) {
    setLoadingSlots(true);
    setSlots(null);
    setSelectedSlot(null);
    setResult(null);
    const res = await fetch(`/api/doctors/${doctorId}/availability?date=${d}`);
    const json = await res.json();
    setLoadingSlots(false);
    if (json.success) setSlots(json.data.slots);
  }

  async function confirmBooking() {
    if (!selectedSlot) return;
    setBooking(true);
    setResult(null);

    let notes: string | undefined;
    try {
      notes = localStorage.getItem(SYMPTOM_NOTES_KEY) ?? undefined;
    } catch {}

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date, startTime: selectedSlot, notes }),
    });

    if (res.status === 401) {
      const currentUrl = window.location.pathname;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`);
      return;
    }

    const json = await res.json();
    setBooking(false);

    if (json.success) {
      setResult({ success: true, message: `Booked for ${date} at ${formatTime12h(selectedSlot)}.` });
      setSlots(null);
      setSelectedSlot(null);
      setAppointmentId(json.data.id);
      setPayState("idle");
      setPayMessage(null);
      setDrawerOpen(false);
      try {
        localStorage.removeItem(SYMPTOM_NOTES_KEY);
      } catch {}
    } else {
      setResult({ success: false, message: json.error?.message ?? "Booking failed" });
      loadSlots(date);
    }
  }

  async function payDeposit() {
    if (!appointmentId) return;
    setPayState("loading");
    setPayMessage(null);

    try {
      await loadRazorpayScript();

      const orderRes = await fetch(`/api/appointments/${appointmentId}/payment/create-order`, {
        method: "POST",
      });
      const orderJson = await orderRes.json();

      if (!orderJson.success) {
        setPayState("error");
        setPayMessage(orderJson.error?.message ?? "Could not start payment");
        return;
      }

      const { orderId, amount, currency, keyId } = orderJson.data;

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name: "ClinicAI",
        description: "Booking deposit",
        theme: { color: "#1f6f6b" },
        handler: async (response: any) => {
          const verifyRes = await fetch(`/api/appointments/${appointmentId}/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyJson = await verifyRes.json();
          if (verifyJson.success) {
            setPayState("paid");
          } else {
            setPayState("error");
            setPayMessage(verifyJson.error?.message ?? "Verification failed");
          }
        },
        modal: {
          ondismiss: () => setPayState("idle"),
        },
      });

      rzp.open();
    } catch (err) {
      setPayState("error");
      setPayMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const selectedDay = days.find((d) => d.iso === date);
  const body = (
    <div className="flex flex-col gap-5">
      {/* Date strip */}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-ink-50 font-medium mb-2">Select date</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {days.map((d) => (
            <button
              key={d.iso}
              onClick={() => setDate(d.iso)}
              className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg shrink-0 transition-colors ${
                date === d.iso
                  ? "bg-ink text-paper"
                  : "bg-line/20 text-ink-70 hover:bg-line/40 border border-transparent"
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wide ${date === d.iso ? "text-paper/70" : "text-ink-50"}`}>
                {d.isToday ? "Today" : d.weekday}
              </span>
              <span className="font-mono text-base font-semibold mt-0.5">{d.day}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slots */}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-ink-50 font-medium mb-2">Available times</p>
        {loadingSlots && (
          <div className="flex items-center gap-2 text-sm text-ink-50 py-4">
            <Loader2 size={15} className="animate-spin" /> Checking availability…
          </div>
        )}
        {!loadingSlots && slots && slots.length === 0 && (
          <div className="flex flex-col items-center text-center py-8 px-4 bg-line/10 rounded-lg">
            <CalendarX2 size={20} strokeWidth={1.5} className="text-ink-50 mb-2" />
            <p className="text-sm text-ink-70">No slots available on this date.</p>
            <p className="text-xs text-ink-50 mt-1">Try another date from the strip above.</p>
          </div>
        )}
        {!loadingSlots && slots && slots.length > 0 && (
          <div className="flex flex-col gap-3">
            {groupSlots(slots).map((g) => (
              <div key={g.label}>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-50 uppercase tracking-wide mb-1.5">
                  <g.icon size={12} strokeWidth={1.75} />
                  {g.label}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {g.items.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSlot(s)}
                      className={`py-2 px-1 rounded-md text-center font-mono text-sm transition-colors border ${
                        selectedSlot === s
                          ? "bg-teal text-paper border-teal"
                          : "bg-line/15 text-ink border-transparent hover:border-teal hover:text-teal"
                      }`}
                    >
                      {formatTime12h(s)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected summary + confirm */}
      {selectedSlot && !result?.success && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-line/15">
            <span className="text-sm text-ink-70">Selected</span>
            <span className="font-mono text-sm text-teal font-medium">
              {selectedDay?.weekday} {selectedDay?.day} · {formatTime12h(selectedSlot)}
            </span>
          </div>
          {hasNotes && (
            <p className="text-xs text-ink-50">
              Your symptom notes from ClinicAI will be shared with the doctor.
            </p>
          )}
          <button
            onClick={confirmBooking}
            disabled={booking}
            className="w-full py-3 rounded-lg bg-ink text-paper text-sm font-medium hover:bg-ink/90 disabled:opacity-60 transition-colors"
          >
            {booking ? "Confirming…" : `Confirm appointment · ₹${consultationFee.toLocaleString("en-IN")}`}
          </button>
        </div>
      )}

      {result && !result.success && <p className="text-sm text-red">{result.message}</p>}

      {result?.success && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-teal-soft">
            <CheckCircle2 size={18} className="text-teal mt-0.5 shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm text-ink font-medium">Appointment confirmed</p>
              <p className="text-xs text-ink-70 mt-0.5">{result.message}</p>
            </div>
          </div>
          <a href="/my-appointments" className="text-sm text-teal hover:underline underline-offset-2">
            View my appointments →
          </a>

          {appointmentId && payState !== "paid" && (
            <div className="p-4 rounded-lg border border-line-strong">
              <p className="text-sm text-ink-70 mb-3">
                Optional — secure your slot with a deposit, which helps the clinic reduce no-shows.
              </p>
              <button
                onClick={payDeposit}
                disabled={payState === "loading"}
                className="w-full py-2.5 rounded-lg border border-line-strong text-sm text-ink hover:border-ink disabled:opacity-60 transition-colors"
              >
                {payState === "loading" ? "Opening payment…" : "Pay deposit"}
              </button>
              {payMessage && <p className="mt-2 text-sm text-red">{payMessage}</p>}
            </div>
          )}
          {payState === "paid" && (
            <p className="text-sm text-teal flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Deposit paid — slot fully secured.
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sticky card */}
      <div className="hidden lg:block sticky top-6 bg-paper rounded-xl border border-line shadow-[0_1px_3px_rgba(18,35,61,0.05),0_8px_24px_-16px_rgba(18,35,61,0.12)] overflow-hidden">
        <div className="p-6 border-b border-line flex items-start justify-between">
          <div>
            <h2 className="font-serif text-lg text-ink">Book an appointment</h2>
          </div>
          <div className="text-right">
            <p className="font-mono text-xl text-ink font-semibold">₹{consultationFee.toLocaleString("en-IN")}</p>
            <p className="text-[10px] uppercase tracking-wide text-ink-50">Consultation</p>
          </div>
        </div>
        <div className="p-6">{body}</div>
      </div>

      {/* Mobile sticky bar + drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-sm border-t border-line px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-serif text-sm text-ink">{doctorName}</p>
            <p className="font-mono text-sm text-teal font-medium">₹{consultationFee.toLocaleString("en-IN")}</p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="py-2.5 px-5 rounded-lg bg-ink text-paper text-sm font-medium"
          >
            {selectedSlot ? "Review & confirm" : "Select a slot"}
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-paper rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg text-ink">Book an appointment</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-ink-50 text-sm">
                Close
              </button>
            </div>
            {body}
          </div>
        </div>
      )}
    </>
  );
}
