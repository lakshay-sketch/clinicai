import { symptomAgentService } from "@/server/services/symptomAgent.service";
import { faqAgentService } from "@/server/services/faqAgent.service";
import { llmClassifierService } from "@/server/services/llmClassifier.service";
import { prisma } from "@/server/lib/prisma";

const EMERGENCY_TRIGGERS = [
  "can't breathe", "cannot breathe", "difficulty breathing", "severe bleeding",
  "unconscious", "not breathing", "heart attack", "stroke", "severe chest pain",
  "suicidal", "want to die", "overdose", "seizure right now", "collapsed",
];
const GREETING_TRIGGERS = ["hi", "hello", "hey", "good morning", "good evening", "good afternoon"];
const THANKS_TRIGGERS = ["thank you", "thanks", "thankyou", "appreciate it"];
const GOODBYE_TRIGGERS = ["bye", "goodbye", "see you", "that's all"];
const FAQ_TRIGGERS = [
  "parking", "insurance", "timing", "hours", "documents", "fee", "cost",
  "cancel", "reschedule", "report", "pharmacy", "payment", "location", "address",
];
const BOOKING_TRIGGERS = ["book", "appointment", "schedule", "queue", "walk in", "walk-in"];

type ChatResult =
  | { type: "emergency"; reply: string }
  | { type: "symptom_match"; specializationId: string; specializationName: string; reply: string }
  | { type: "faq_answer"; reply: string }
  | { type: "booking_prompt"; reply: string }
  | { type: "greeting"; reply: string }
  | { type: "smalltalk"; reply: string }
  | { type: "fallback"; reply: string };

async function specializationIdByName(name: string): Promise<{ id: string; name: string } | null> {
  console.log("[Orchestrator] Looking up specialization by name:", JSON.stringify(name));
  const spec = await prisma.specialization.findFirst({ where: { name } });
  console.log("[Orchestrator] DB lookup result:", JSON.stringify(spec));
  return spec ? { id: spec.id, name: spec.name } : null;
}

async function handleRuleBased(clinicId: string, message: string): Promise<ChatResult> {
  const lower = message.toLowerCase().trim();

  if (EMERGENCY_TRIGGERS.some((t) => lower.includes(t))) {
    return {
      type: "emergency",
      reply:
        "This sounds like it could be a medical emergency. Please call your local emergency number or go to the nearest emergency room right away — don't wait for an appointment.",
    };
  }

  if (GREETING_TRIGGERS.some((t) => lower === t || lower.startsWith(t + " "))) {
    return {
      type: "greeting",
      reply: "Hi! I can help you find the right doctor, answer questions about the clinic, or help you book. What's going on?",
    };
  }

  if (THANKS_TRIGGERS.some((t) => lower.includes(t))) {
    return { type: "smalltalk", reply: "You're welcome! Let me know if there's anything else I can help with." };
  }

  if (GOODBYE_TRIGGERS.some((t) => lower.includes(t))) {
    return { type: "smalltalk", reply: "Take care! Come back anytime you need to book or have a question." };
  }

  if (FAQ_TRIGGERS.some((t) => lower.includes(t))) {
    const faqMatch = await faqAgentService.search(clinicId, message);
    if (faqMatch) return { type: "faq_answer", reply: faqMatch.answer };
  }

  if (BOOKING_TRIGGERS.some((t) => lower.includes(t))) {
    return {
      type: "booking_prompt",
      reply: "I can help you book. Tell me your symptoms, or the specialist you'd like to see.",
    };
  }

  const symptomMatch = symptomAgentService.matchSpecialization(message);
  if (symptomMatch) {
    return {
      type: "symptom_match",
      specializationId: symptomMatch.specializationId,
      specializationName: symptomMatch.specializationName,
      reply: `Based on what you've described, I'd recommend seeing a ${symptomMatch.specializationName}. Would you like to see available doctors?`,
    };
  }

  const faqFallback = await faqAgentService.search(clinicId, message);
  if (faqFallback) return { type: "faq_answer", reply: faqFallback.answer };

  return {
    type: "fallback",
    reply:
      "I'm not quite sure I understood that. Could you tell me more — for example, describe how you're feeling, or ask about clinic hours, fees, or booking an appointment?",
  };
}

export const orchestratorService = {
  handle: async (clinicId: string, message: string): Promise<ChatResult> => {
    // Try the LLM classifier first for genuinely better language understanding.
    // Falls back to the rule-based system below on ANY failure — the chat
    // must never break just because Groq is unavailable or rate-limited.
    const llmResult = await llmClassifierService.classify(message);

    if (llmResult) {
      switch (llmResult.intent) {
        case "emergency":
          return {
            type: "emergency",
            reply:
              "This sounds like it could be a medical emergency. Please call your local emergency number or go to the nearest emergency room right away — don't wait for an appointment.",
          };
        case "greeting":
          return {
            type: "greeting",
            reply: "Hi! I can help you find the right doctor, answer questions about the clinic, or help you book. What's going on?",
          };
        case "smalltalk":
          return { type: "smalltalk", reply: "Happy to help! Let me know if there's anything else." };
        case "symptom": {
          console.log("[Orchestrator] LLM symptom case, specialization field:", JSON.stringify(llmResult.specialization));
          if (llmResult.specialization) {
            const spec = await specializationIdByName(llmResult.specialization);
            if (spec) {
              return {
                type: "symptom_match",
                specializationId: spec.id,
                specializationName: spec.name,
                reply: `Based on what you've described, I'd recommend seeing a ${spec.name}. Would you like to see available doctors?`,
              };
            }
          }
          break; // fall through to rule-based if no valid specialization matched
        }
        case "faq": {
          const faqMatch = await faqAgentService.search(clinicId, message);
          if (faqMatch) return { type: "faq_answer", reply: faqMatch.answer };
          break;
        }
        case "booking":
          return {
            type: "booking_prompt",
            reply: "I can help you book. Tell me your symptoms, or the specialist you'd like to see.",
          };
        // "unclear" falls through to rule-based fallback below
      }
    }

    // Fallback: LLM unavailable, failed, or returned "unclear"/unmatched case
    return handleRuleBased(clinicId, message);
  },
};
