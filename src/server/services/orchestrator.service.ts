import { symptomAgentService } from "@/server/services/symptomAgent.service";
import { faqAgentService } from "@/server/services/faqAgent.service";
import { llmClassifierService } from "@/server/services/llmClassifier.service";
import { prisma } from "@/server/lib/prisma";

const EMERGENCY_TRIGGERS = [
  "can't breathe", "cannot breathe", "difficulty breathing", "severe bleeding",
  "unconscious", "not breathing", "heart attack", "stroke", "severe chest pain",
  "suicidal", "want to die", "overdose", "seizure right now", "collapsed",
];
const GREETING_TRIGGERS = ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "namaste"];
const THANKS_TRIGGERS = ["thank you", "thanks", "thankyou", "appreciate it", "dhanyavad", "shukriya"];
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

type Language = "english" | "hindi" | "hinglish";

async function specializationIdByName(name: string): Promise<{ id: string; name: string } | null> {
  const spec = await prisma.specialization.findFirst({ where: { name } });
  return spec ? { id: spec.id, name: spec.name } : null;
}

// Templated, hand-written replies per language — the LLM never invents
// these; it only tells us which template + which specialization to use.
const REPLIES = {
  emergency: {
    english: "This sounds like it could be a medical emergency. Please call your local emergency number or go to the nearest emergency room right away — don't wait for an appointment.",
    hindi: "यह एक चिकित्सा आपातकाल जैसा लग रहा है। कृपया तुरंत अपनी स्थानीय आपातकालीन सेवा को कॉल करें या नज़दीकी अस्पताल की इमरजेंसी में जाएं — अपॉइंटमेंट का इंतज़ार न करें।",
    hinglish: "Yeh ek medical emergency lag rahi hai. Please turant apni local emergency service ko call karein ya nearest hospital ki emergency mein jaayein — appointment ka wait mat kijiye.",
  },
  greeting: {
    english: "Hi! I can help you find the right doctor, answer questions about the clinic, or help you book. What's going on?",
    hindi: "नमस्ते! मैं आपको सही डॉक्टर ढूंढने, क्लिनिक के बारे में सवालों के जवाब देने, या अपॉइंटमेंट बुक करने में मदद कर सकता हूं। क्या हुआ है?",
    hinglish: "Hi! Main aapko sahi doctor dhundhne, clinic ke baare mein sawaalon ka jawab dene, ya appointment book karne mein help kar sakta hoon. Kya ho raha hai?",
  },
  smalltalkThanks: {
    english: "You're welcome! Let me know if there's anything else I can help with.",
    hindi: "आपका स्वागत है! अगर कुछ और मदद चाहिए तो बताइए।",
    hinglish: "Aapka swagat hai! Agar aur kuch help chahiye toh bataiye.",
  },
  smalltalkBye: {
    english: "Take care! Come back anytime you need to book or have a question.",
    hindi: "अपना ख्याल रखिए! जब भी अपॉइंटमेंट बुक करनी हो या कोई सवाल हो, वापस आइए।",
    hinglish: "Apna khayal rakhiye! Jab bhi appointment book karni ho ya koi sawaal ho, wapas aa jaiye.",
  },
  bookingPrompt: {
    english: "I can help you book. Tell me your symptoms, or the specialist you'd like to see.",
    hindi: "मैं आपको बुकिंग में मदद कर सकता हूं। अपने लक्षण बताइए, या बताइए आप किस डॉक्टर से मिलना चाहते हैं।",
    hinglish: "Main aapko booking mein help kar sakta hoon. Apne symptoms bataiye, ya bataiye aap kis specialist se milna chahte hain.",
  },
  fallback: {
    english: "I'm not quite sure I understood that. Could you tell me more — for example, describe how you're feeling, or ask about clinic hours, fees, or booking an appointment?",
    hindi: "मुझे ठीक से समझ नहीं आया। कृपया थोड़ा और बताइए — जैसे आप कैसा महसूस कर रहे हैं, या क्लिनिक के समय, फीस, या अपॉइंटमेंट के बारे में पूछिए।",
    hinglish: "Mujhe theek se samajh nahi aaya. Thoda aur bataiye — jaise aap kaisa feel kar rahe hain, ya clinic ke timing, fees, ya appointment ke baare mein poochiye.",
  },
};

function symptomReply(specializationName: string, language: Language): string {
  if (language === "hindi") return `आपने जो बताया उसके आधार पर, मैं ${specializationName} से मिलने की सलाह दूंगा। क्या आप उपलब्ध डॉक्टर देखना चाहेंगे?`;
  if (language === "hinglish") return `Aapne jo bataya uske hisaab se, main ${specializationName} se milne ki salaah dunga. Kya aap available doctors dekhna chahenge?`;
  return `Based on what you've described, I'd recommend seeing a ${specializationName}. Would you like to see available doctors?`;
}

async function handleRuleBased(clinicId: string, message: string): Promise<ChatResult> {
  const lower = message.toLowerCase().trim();

  if (EMERGENCY_TRIGGERS.some((t) => lower.includes(t))) {
    return { type: "emergency", reply: REPLIES.emergency.english };
  }
  if (GREETING_TRIGGERS.some((t) => lower === t || lower.startsWith(t + " "))) {
    return { type: "greeting", reply: REPLIES.greeting.english };
  }
  if (THANKS_TRIGGERS.some((t) => lower.includes(t))) {
    return { type: "smalltalk", reply: REPLIES.smalltalkThanks.english };
  }
  if (GOODBYE_TRIGGERS.some((t) => lower.includes(t))) {
    return { type: "smalltalk", reply: REPLIES.smalltalkBye.english };
  }
  if (FAQ_TRIGGERS.some((t) => lower.includes(t))) {
    const faqMatch = await faqAgentService.search(clinicId, message);
    if (faqMatch) return { type: "faq_answer", reply: faqMatch.answer };
  }
  if (BOOKING_TRIGGERS.some((t) => lower.includes(t))) {
    return { type: "booking_prompt", reply: REPLIES.bookingPrompt.english };
  }
  const symptomMatch = symptomAgentService.matchSpecialization(message);
  if (symptomMatch) {
    return {
      type: "symptom_match",
      specializationId: symptomMatch.specializationId,
      specializationName: symptomMatch.specializationName,
      reply: symptomReply(symptomMatch.specializationName, "english"),
    };
  }
  const faqFallback = await faqAgentService.search(clinicId, message);
  if (faqFallback) return { type: "faq_answer", reply: faqFallback.answer };

  return { type: "fallback", reply: REPLIES.fallback.english };
}

export const orchestratorService = {
  handle: async (clinicId: string, message: string): Promise<ChatResult> => {
    const llmResult = await llmClassifierService.classify(message);

    if (llmResult) {
      const lang = llmResult.language;

      switch (llmResult.intent) {
        case "emergency":
          return { type: "emergency", reply: REPLIES.emergency[lang] };
        case "greeting":
          return { type: "greeting", reply: REPLIES.greeting[lang] };
        case "smalltalk":
          return { type: "smalltalk", reply: REPLIES.smalltalkThanks[lang] };
        case "symptom": {
          if (llmResult.specialization) {
            const spec = await specializationIdByName(llmResult.specialization);
            if (spec) {
              return {
                type: "symptom_match",
                specializationId: spec.id,
                specializationName: spec.name,
                reply: symptomReply(spec.name, lang),
              };
            }
          }
          break;
        }
        case "faq": {
          const faqMatch = await faqAgentService.search(clinicId, message);
          if (faqMatch) {
            if (lang !== "english") {
              const translated = await llmClassifierService.translateReply(faqMatch.answer, lang);
              if (translated) return { type: "faq_answer", reply: translated };
            }
            return { type: "faq_answer", reply: faqMatch.answer };
          }
          break;
        }
        case "booking":
          return { type: "booking_prompt", reply: REPLIES.bookingPrompt[lang] };
      }
    }

    return handleRuleBased(clinicId, message);
  },
};
