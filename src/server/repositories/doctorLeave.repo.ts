import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";

export const doctorLeaveRepo = {
  // Confirms the doctor belongs to this clinic before we let anyone touch
  // their leave records — same isolation idea as Doctor update.
  doctorBelongsToClinic: async (doctorId: string, clinicId: string) => {
    const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, clinicId } });
    return doctor !== null;
  },

  create: async (doctorId: string, data: Prisma.DoctorLeaveCreateWithoutDoctorInput) => {
    return prisma.doctorLeave.create({
      data: { ...data, doctor: { connect: { id: doctorId } } },
    });
  },

  listForDoctor: async (doctorId: string) => {
    return prisma.doctorLeave.findMany({
      where: { doctorId },
      orderBy: { dateFrom: "desc" },
    });
  },

  // Deletes only if the leave's doctor belongs to this clinic.
  deleteById: async (leaveId: string, clinicId: string) => {
    const result = await prisma.doctorLeave.deleteMany({
      where: { id: leaveId, doctor: { clinicId } },
    });
    return result.count;
  },
};
