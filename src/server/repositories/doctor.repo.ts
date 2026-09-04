import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { DoctorSearchQuery } from "@/server/validation/doctor.validation";

export const doctorRepo = {
  search: async (query: DoctorSearchQuery) => {
    const where: Prisma.DoctorWhereInput = {
      isActive: true,
      ...(query.specializationId && { specializationId: query.specializationId }),
      ...(query.clinicId && { clinicId: query.clinicId }),
      ...((query.city || query.area) && {
        clinic: {
          ...(query.city && { city: query.city }),
          ...(query.area && { area: query.area }),
        },
      }),
    };

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          specialization: true,
          clinic: true,
        },
        orderBy: { [query.sortBy]: query.order },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.doctor.count({ where }),
    ]);

    return { doctors, total };
  },

  // Clinic-scoped update: `clinicId` is part of the WHERE clause, not just the
  // payload. If the doctor doesn't belong to this clinic, `count` comes back
  // 0 — the caller (service layer) treats that as "not found," never leaking
  // whether a doctor with this id exists in some *other* clinic.
  updateById: async (id: string, clinicId: string, data: Prisma.DoctorUpdateInput) => {
    const result = await prisma.doctor.updateMany({
      where: { id, clinicId },
      data,
    });
    return result.count; // 0 = no match in this clinic, 1 = updated
  },

  // Plain insert. Whoever calls this (the service) is responsible for
  // ensuring `data.clinicId` was set from the authenticated actor, never
  // from request input — this method trusts what it's given.
  create: async (data: Prisma.DoctorCreateInput) => {
    return prisma.doctor.create({
      data,
      include: { specialization: true, clinic: true },
    });
  },
};
