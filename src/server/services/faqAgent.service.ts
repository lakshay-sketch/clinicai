import { prisma } from "@/server/lib/prisma";

// V1: simple substring/word-overlap scoring against seeded FAQ questions.
// Swappable for an embedding-based search later without changing the caller.
export const faqAgentService = {
  search: async (clinicId: string, message: string) => {
    const faqs = await prisma.fAQ.findMany({ where: { clinicId } });
    const words = message.toLowerCase().split(/\W+/).filter((w) => w.length > 2);

    let best: { question: string; answer: string; score: number } | null = null;

    for (const faq of faqs) {
      const qLower = faq.question.toLowerCase();
      const score = words.filter((w) => qLower.includes(w)).length;
      if (score > 0 && (!best || score > best.score)) {
        best = { question: faq.question, answer: faq.answer, score };
      }
    }

    return best;
  },
};
