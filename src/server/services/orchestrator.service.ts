import { symptomAgentService } from "@/server/services/symptomAgent.service";
import { faqAgentService } from "@/server/services/faqAgent.service";

const FAQ_TRIGGERS = ["parking", "insurance", "timing", "hours", "documents", "fee", "cost", "cancel", "reschedule", "report", "pharmacy"];
const BOOKING_TRIGGERS = ["book", "appointment", "schedule", "queue", "walk in", "walk-in"];

type ChatResult =
  | { type: "symptom_match"; specializationId: string; specializationName: string; reply: string }
  | { type: "faq_answer"; reply: string }
  | { type: "booking_prompt"; reply: string }
  | { type: "fallback"; reply: string };

export const orchestratorService = {
  handle: async (clinicId: string, message: string): Promise<ChatResult> => {
    const lower = message.toLowerCase();

    // 1. FAQ-shaped question first (cheap, specific triggers)
    if (FAQ_TRIGGERS.some((t) => lower.includes(t))) {
      const faqMatch = await faqAgentService.search(clinicId, message);
      if (faqMatch) {
        return { type: "faq_answer", reply: faqMatch.answer };
      }
    }

    // 2. Explicit booking intent
    if (BOOKING_TRIGGERS.some((t) => lower.includes(t))) {
      return {
        type: "booking_prompt",
        reply: "I can help you book. Tell me your symptoms, or the specialist you'd like to see.",
      };
    }

    // 3. Symptom description
    const symptomMatch = symptomAgentService.matchSpecialization(message);
    if (symptomMatch) {
      return {
        type: "symptom_match",
        specializationId: symptomMatch.specializationId,
        specializationName: symptomMatch.specializationName,
        reply: `Based on what you've described, I'd recommend seeing a ${symptomMatch.specializationName}. Would you like to see available doctors?`,
      };
    }

    // 4. Last-resort FAQ search even without trigger words
    const faqFallback = await faqAgentService.search(clinicId, message);
    if (faqFallback) {
      return { type: "faq_answer", reply: faqFallback.answer };
    }

    return {
      type: "fallback",
      reply: "I'm not sure I understood that. Could you describe your symptoms, or ask about clinic hours, fees, or booking?",
    };
  },
};
