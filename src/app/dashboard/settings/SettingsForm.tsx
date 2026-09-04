"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Clinic = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export default function SettingsForm({ clinic, readOnly }: { clinic: Clinic; readOnly: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/clinics/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: form.get("phone"),
        email: form.get("email"),
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error?.message ?? "Something went wrong");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-ink-60 mb-1">Clinic name</label>
        <input defaultValue={clinic.name} disabled className="w-full border border-line px-3 py-2 text-sm bg-line/30" />
      </div>
      <div>
        <label className="block text-xs text-ink-60 mb-1">Address</label>
        <input defaultValue={clinic.address} disabled className="w-full border border-line px-3 py-2 text-sm bg-line/30" />
      </div>
      <div>
        <label className="block text-xs text-ink-60 mb-1">Phone</label>
        <input name="phone" defaultValue={clinic.phone} disabled={readOnly} className="w-full border border-line px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-ink-60 mb-1">Email</label>
        <input name="email" type="email" defaultValue={clinic.email} disabled={readOnly} className="w-full border border-line px-3 py-2 text-sm" />
      </div>

      {!readOnly && (
        <button
          type="submit"
          disabled={loading}
          className="bg-ink text-paper text-sm px-4 py-2 hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      )}
      {saved && <p className="text-sm text-teal">Saved.</p>}
      {error && <p className="text-sm text-red">{error}</p>}
    </form>
  );
}
