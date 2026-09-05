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

If intent is "symptom", also pick the single most relevant specialization from EXACTLY this list (or null if none fit well):
${VALID_SPECIALIZATIONS.join(", ")}

Respond with ONLY valid JSON, no other text, in this exact shape:
{"intent": "...", "specialization": "..." or null, "reasoning": "one short sentence"}`;

export const llmClassifierService = {
  classify: async (message: string): Promise<LlmIntent | null> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.log("[LLM] No GROQ_API_KEY set");
      return null;
    }

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
          max_tokens: 150,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.log("[LLM] Groq returned non-OK status:", res.status, errText);
        return null;
      }

      const data = await res.json();
      console.log("[LLM] Raw Groq response:", JSON.stringify(data));

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.log("[LLM] No content in Groq response");
        return null;
      }

      const parsed = JSON.parse(content);
      console.log("[LLM] Parsed classification:", JSON.stringify(parsed));

      if (!["emergency", "symptom", "faq", "booking", "greeting", "smalltalk", "unclear"].includes(parsed.intent)) {
        console.log("[LLM] Invalid intent value:", parsed.intent);
        return null;
      }
      if (parsed.specialization && !VALID_SPECIALIZATIONS.includes(parsed.specialization)) {
        console.log("[LLM] Specialization not in valid list, nulling:", parsed.specialization);
        parsed.specialization = null;
      }

      return parsed as LlmIntent;
    } catch (err) {
      console.log("[LLM] Exception:", err);
      return null;
    }
  },
};
