import { prisma } from "@/server/lib/prisma";

export const clinicQrRepo = {
  findByToken: async (qrToken: string) => {
    return prisma.clinic.findUnique({
      where: { qrToken },
      include: {
        doctors: {
          where: { isActive: true, isAvailable: true },
          include: { specialization: true },
        },
      },
    });
  },
};
