import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";

export const clinicRepo = {
  findById: async (id: string) => {
    return prisma.clinic.findUnique({ where: { id } });
  },

  updateById: async (id: string, data: Prisma.ClinicUpdateInput) => {
    return prisma.clinic.update({ where: { id }, data });
  },
};
