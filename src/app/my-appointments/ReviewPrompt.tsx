"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewPrompt({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, rating, reviewText: text || undefined }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!json.success) {
      setError(json.error?.message ?? "Could not submit review");
      return;
    }
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-teal hover:underline underline-offset-2"
      >
        How was your visit? Leave a review →
      </button>
    );
  }

  return (
    <div className="border border-line p-3 max-w-sm">
      <p className="text-xs text-ink-60 mb-2">Rate your visit</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={`text-lg ${n <= rating ? "text-amber" : "text-line-strong"}`}
            aria-label={`${n} star`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Optional comment"
        rows={2}
        className="w-full border border-line-strong px-2 py-1.5 text-sm mb-2"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={submitting}
          className="bg-ink text-paper text-xs px-3 py-1.5 hover:bg-ink/90 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-ink-60 hover:text-ink"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red mt-2">{error}</p>}
    </div>
  );
}
