import { prisma } from "@/server/lib/prisma";

export const staffRepo = {
  createInvite: async (clinicId: string, email: string, name: string, role: "ADMIN" | "RECEPTION") => {
    return prisma.staffUser.create({
      data: {
        clinic: { connect: { id: clinicId } },
        email,
        name,
        role,
        isActive: true,
      },
    });
  },

  findByEmail: async (email: string) => {
    return prisma.staffUser.findFirst({ where: { email } });
  },
};
