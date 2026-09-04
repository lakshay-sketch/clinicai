"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InviteStaffForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/staff/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        name: form.get("name"),
        role: form.get("role"),
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
      <input name="email" type="email" placeholder="Email" required className="border border-line px-3 py-2 text-sm" />
      <select name="role" required className="border border-line px-3 py-2 text-sm">
        <option value="RECEPTION">Reception</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        type="submit"
        disabled={loading}
        className="col-span-3 bg-ink text-paper text-sm py-2 hover:bg-ink/90 disabled:opacity-50"
      >
        {loading ? "Sending invite…" : "Send invite"}
      </button>
      {error && <p className="col-span-3 text-sm text-red">{error}</p>}
    </form>
  );
}
