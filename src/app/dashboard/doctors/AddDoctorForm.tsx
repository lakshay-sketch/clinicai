"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddDoctorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        qualification: form.get("qualification"),
        specializationId: form.get("specializationId"),
        experienceYears: Number(form.get("experienceYears")),
        consultationFee: Number(form.get("consultationFee")),
        slotDurationMinutes: Number(form.get("slotDurationMinutes")),
        avgConsultationMinutes: Number(form.get("slotDurationMinutes")),
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error?.message ?? "Something went wrong");
      return;
    }
    router.refresh();
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3">
      <input name="name" placeholder="Full name" required className="border border-line px-3 py-2 text-sm" />
      <input name="qualification" placeholder="Qualification" required className="border border-line px-3 py-2 text-sm" />
      <input name="specializationId" placeholder="Specialization id (e.g. spec_gp)" required className="border border-line px-3 py-2 text-sm" />
      <input name="experienceYears" type="number" placeholder="Years of experience" required className="border border-line px-3 py-2 text-sm" />
      <input name="consultationFee" type="number" placeholder="Consultation fee (₹)" required className="border border-line px-3 py-2 text-sm" />
      <input name="slotDurationMinutes" type="number" placeholder="Slot length (min)" required className="border border-line px-3 py-2 text-sm" />
      <button
        type="submit"
        disabled={loading}
        className="col-span-3 bg-ink text-paper text-sm py-2 hover:bg-ink/90 disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add doctor"}
      </button>
      {error && <p className="col-span-3 text-sm text-red">{error}</p>}
    </form>
  );
}
