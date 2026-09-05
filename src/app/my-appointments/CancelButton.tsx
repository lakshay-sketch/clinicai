"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    if (!confirm("Cancel this appointment?")) return;
    setLoading(true);
    await fetch(`/api/appointments/${appointmentId}/cancel`, { method: "PATCH" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={cancel}
      disabled={loading}
      className="text-sm text-red hover:underline disabled:opacity-50"
    >
      {loading ? "Cancelling…" : "Cancel"}
    </button>
  );
}
