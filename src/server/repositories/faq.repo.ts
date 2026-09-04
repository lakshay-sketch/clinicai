import { prisma } from "@/server/lib/prisma";

export const faqRepo = {
  listForClinic: async (clinicId: string) => {
    return prisma.fAQ.findMany({ where: { clinicId } });
  },

  create: async (clinicId: string, question: string, answer: string) => {
    return prisma.fAQ.create({
      data: { clinic: { connect: { id: clinicId } }, question, answer },
    });
  },

  updateById: async (id: string, clinicId: string, data: { question?: string; answer?: string }) => {
    const result = await prisma.fAQ.updateMany({
      where: { id, clinicId },
      data,
    });
    return result.count;
  },

  deleteById: async (id: string, clinicId: string) => {
    const result = await prisma.fAQ.deleteMany({ where: { id, clinicId } });
    return result.count;
  },
};
