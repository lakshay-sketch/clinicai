"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
      <Input name="name" placeholder="Full name" required />
      <Input name="qualification" placeholder="Qualification" required />
      <Input name="specializationId" placeholder="Specialization id (e.g. spec_gp)" required />
      <Input name="experienceYears" type="number" placeholder="Years of experience" required />
      <Input name="consultationFee" type="number" placeholder="Consultation fee (₹)" required />
      <Input name="slotDurationMinutes" type="number" placeholder="Slot length (min)" required />
      <Button type="submit" disabled={loading} className="col-span-3">
        {loading ? "Adding…" : "Add doctor"}
      </Button>
      {error && <p className="col-span-3 text-sm text-red">{error}</p>}
    </form>
  );
}
