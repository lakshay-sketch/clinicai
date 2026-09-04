"use client";

import { useState } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  text: string;
  specializationId?: string;
};

export default function ChatWidget({ clinicId }: { clinicId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi, how can I help? You can describe symptoms or ask about the clinic." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((m) => [...m, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicId, message: userMessage }),
    });
    const json = await res.json();
    setLoading(false);

    if (json.success) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: json.data.reply, specializationId: json.data.specializationId },
      ]);
    } else {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong. Please try again." }]);
    }
  }

  return (
    <div className="border border-line">
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <p
              className={`inline-block px-3 py-2 text-sm max-w-[85%] ${
                m.role === "user" ? "bg-ink text-paper" : "bg-line/30 text-ink"
              }`}
            >
              {m.text}
            </p>
            {m.specializationId && (
              <div className="mt-2">
                <Link
                  href={`/find?specializationId=${m.specializationId}`}
                  className="text-sm text-teal underline"
                >
                  See available doctors →
                </Link>
              </div>
            )}
          </div>
        ))}
        {loading && <p className="text-sm text-ink-60">Thinking…</p>}
      </div>
      <div className="border-t border-line p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your message…"
          className="flex-1 border border-line px-3 py-2 text-sm"
        />
        <button
          onClick={send}
          disabled={loading}
          className="bg-ink text-paper text-sm px-4 py-2 hover:bg-ink/90 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
