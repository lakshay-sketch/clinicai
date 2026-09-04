import { faqRepo } from "@/server/repositories/faq.repo";
import { NotFoundError } from "@/server/lib/errors";
import type { Actor } from "@/server/middleware/withAuth";
import type { FaqCreateInput, FaqUpdateInput } from "@/server/validation/faq.validation";

export const faqService = {
  listForClinic: async (clinicId: string) => {
    return faqRepo.listForClinic(clinicId);
  },

  create: async (actor: Actor, data: FaqCreateInput) => {
    if (actor.type !== "STAFF") throw new NotFoundError("Not permitted");
    return faqRepo.create(actor.clinicId, data.question, data.answer);
  },

  update: async (actor: Actor, faqId: string, data: FaqUpdateInput) => {
    if (actor.type !== "STAFF") throw new NotFoundError("FAQ not found");
    const count = await faqRepo.updateById(faqId, actor.clinicId, data);
    if (count === 0) throw new NotFoundError("FAQ not found");
  },

  delete: async (actor: Actor, faqId: string) => {
    if (actor.type !== "STAFF") throw new NotFoundError("FAQ not found");
    const count = await faqRepo.deleteById(faqId, actor.clinicId);
    if (count === 0) throw new NotFoundError("FAQ not found");
  },
};
