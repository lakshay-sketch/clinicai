const VALID_SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Dermatologist", "Dentist",
  "Ophthalmologist", "ENT Specialist", "Orthopedic", "Pediatrician",
  "Gynecologist", "Neurologist", "Psychiatrist",
] as const;

export type LlmIntent = {
  intent: "emergency" | "symptom" | "faq" | "booking" | "greeting" | "smalltalk" | "unclear";
  specialization: string | null;
  reasoning: string;
};

const SYSTEM_PROMPT = `You are an intent classifier for a clinic receptionist chatbot. Classify the patient's message into exactly one of these intents:
- "emergency": describes a medical emergency (severe symptoms, can't breathe, unconscious, severe bleeding, heart attack signs, suicidal ideation)
- "symptom": describes a health symptom or asks what kind of doctor to see
- "faq": asks about clinic hours, fees, parking, insurance, documents, cancellation policy, etc.
- "booking": explicitly wants to book/schedule an appointment or join a queue
- "greeting": just saying hi/hello
- "smalltalk": thanks, goodbye, small talk, casual conversation not related to health or the clinic
- "unclear": anything that doesn't fit the above

Never suggest specific medications, dosages, or home remedies, even if asked directly — always route to "symptom" so the patient is directed to see a doctor.

If intent is "symptom", also pick the single most relevant specialization from EXACTLY this list (or null if none fit well):
${VALID_SPECIALIZATIONS.join(", ")}

Respond with ONLY valid JSON, no other text, in this exact shape:
{"intent": "...", "specialization": "..." or null, "reasoning": "one short sentence"}`;

export const llmClassifierService = {
  classify: async (message: string): Promise<LlmIntent | null> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
          temperature: 0.2,
          max_tokens: 500,
          reasoning_effort: "low",
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) return null;

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content);

      if (!["emergency", "symptom", "faq", "booking", "greeting", "smalltalk", "unclear"].includes(parsed.intent)) {
        return null;
      }
      if (parsed.specialization && !VALID_SPECIALIZATIONS.includes(parsed.specialization)) {
        parsed.specialization = null;
      }

      return parsed as LlmIntent;
    } catch {
      return null;
    }
  },
};
