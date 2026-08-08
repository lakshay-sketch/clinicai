import { prisma } from "@/server/lib/prisma";

export const specializationRepo = {
  findAll: () => {
    return prisma.specialization.findMany({
      orderBy: { name: "asc" },
    });
  },
};
