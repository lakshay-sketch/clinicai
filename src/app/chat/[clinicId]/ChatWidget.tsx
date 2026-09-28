"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Send, Stethoscope, Star, ArrowRight } from "lucide-react";

type SuggestedDoctor = {
  id: string;
  name: string;
  specializationId: string;
  consultationFee: number;
  avgRating: number;
  reviewCount: number;
};

type Message = {
  role: "user" | "assistant";
  text: string;
  specializationId?: string;
  doctors?: SuggestedDoctor[];
};

const SYMPTOM_NOTES_KEY = "clinicai_symptom_notes";

const STARTERS = [
  "I have a fever and sore throat",
  "What are your clinic hours?",
  "What are your consultation fees?",
];

function initialsOf(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ChatWidget({ clinicId }: { clinicId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi, how can I help? You can describe symptoms or ask about the clinic." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function fetchSuggestedDoctors(specializationId: string): Promise<SuggestedDoctor[]> {
    try {
      const url = new URL("/api/doctors/search", window.location.origin);
      url.searchParams.set("specializationId", specializationId);
      url.searchParams.set("clinicId", clinicId);
      url.searchParams.set("sortBy", "avgRating");
      url.searchParams.set("pageSize", "2");
      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        return json.data.map((d: any) => ({
          id: d.id,
          name: d.name,
          specializationId: d.specializationId,
          consultationFee: d.consultationFee,
          avgRating: d.avgRating,
          reviewCount: d.reviewCount,
        }));
      }
    } catch {}
    return [];
  }

  async function send(text?: string) {
    const userMessage = text ?? input;
    if (!userMessage.trim()) return;
    setMessages((m) => [...m, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicId, message: userMessage }),
    });
    const json = await res.json();

    if (json.success) {
      if (json.data.type === "symptom_match") {
        try {
          localStorage.setItem(SYMPTOM_NOTES_KEY, userMessage);
        } catch {}
      }

      let doctors: SuggestedDoctor[] = [];
      if (json.data.specializationId) {
        doctors = await fetchSuggestedDoctors(json.data.specializationId);
      }

      setMessages((m) => [
        ...m,
        { role: "assistant", text: json.data.reply, specializationId: json.data.specializationId, doctors },
      ]);
    } else {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <div className="bg-paper rounded-xl border border-line shadow-[0_1px_3px_rgba(18,35,61,0.05),0_8px_24px_-16px_rgba(18,35,61,0.12)] flex flex-col overflow-hidden">
      <div ref={scrollRef} className="p-5 sm:p-6 space-y-5 max-h-[520px] overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex items-start gap-3"}>
            {m.role === "assistant" && (
              <span className="w-8 h-8 rounded-full bg-teal-soft text-teal flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={14} strokeWidth={1.75} />
              </span>
            )}
            <div className={m.role === "user" ? "max-w-[85%]" : "max-w-[85%] flex-1"}>
              <p
                className={
                  m.role === "user"
                    ? "inline-block px-4 py-2.5 text-sm leading-relaxed bg-ink text-paper rounded-2xl rounded-tr-sm"
                    : "inline-block px-4 py-2.5 text-sm leading-relaxed bg-line/25 text-ink rounded-2xl rounded-tl-sm"
                }
              >
                {m.text}
              </p>

              {m.specializationId && (
                <div className="mt-2.5">
                  {m.doctors && m.doctors.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {m.doctors.map((d) => (
                        <Link
                          key={d.id}
                          href={`/doctors/${d.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg border border-line bg-paper hover:border-teal transition-colors"
                        >
                          <span className="w-9 h-9 rounded-full bg-teal-soft text-teal flex items-center justify-center font-serif text-xs font-semibold shrink-0">
                            {initialsOf(d.name)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-ink font-medium truncate">{d.name}</p>
                            <div className="flex items-center gap-2 text-xs text-ink-50 font-mono">
                              {d.reviewCount > 0 ? (
                                <span className="inline-flex items-center gap-0.5">
                                  <Star size={11} className="text-amber fill-amber" /> {d.avgRating.toFixed(1)}
                                </span>
                              ) : (
                                <span>New</span>
                              )}
                              <span>· ₹{d.consultationFee.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                          <ArrowRight size={14} className="text-ink-50 shrink-0" />
                        </Link>
                      ))}
                      <Link
                        href={`/find?specializationId=${m.specializationId}`}
                        className="inline-flex items-center gap-1.5 text-xs text-teal hover:underline underline-offset-2 pl-1"
                      >
                        Browse all <ArrowRight size={11} />
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={`/find?specializationId=${m.specializationId}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-line hover:border-teal text-sm text-ink hover:text-teal transition-colors"
                    >
                      <Stethoscope size={14} strokeWidth={1.75} />
                      View available doctors
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-teal-soft text-teal flex items-center justify-center shrink-0">
              <Sparkles size={14} strokeWidth={1.75} />
            </span>
            <div className="flex items-center gap-1 px-4 py-3 bg-line/25 rounded-2xl rounded-tl-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-50 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-ink-50 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-ink-50 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="px-5 sm:px-6 pb-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs font-mono text-ink-70 bg-line/20 hover:bg-line/40 px-2.5 py-1.5 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-line p-4 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your message…"
          className="flex-1 px-4 py-2.5 rounded-full bg-line/20 text-sm text-ink placeholder:text-ink-50 focus:bg-paper focus:outline-none focus:ring-2 focus:ring-teal-soft transition-all"
        />
        <button
          onClick={() => send()}
          disabled={loading}
          aria-label="Send"
          className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center hover:bg-ink/90 disabled:opacity-50 transition-colors shrink-0"
        >
          <Send size={15} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
