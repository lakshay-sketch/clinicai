import { prisma } from "@/server/lib/prisma";

export const nearbyRepo = {
  // Dataset is small (dozens of doctors), so we fetch active doctors with
  // their clinic's coordinates and compute distance in application code
  // rather than raw SQL — simplest correct approach at this scale.
  findActiveDoctorsWithCoords: async (specializationId?: string) => {
    return prisma.doctor.findMany({
      where: {
        isActive: true,
        ...(specializationId && { specializationId }),
      },
      include: { specialization: true, clinic: true },
    });
  },
};
