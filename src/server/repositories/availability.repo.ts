import { prisma } from "@/server/lib/prisma";

export const availabilityRepo = {
  // Doctor's recurring weekly rows for this weekday
  getWeeklyRows: async (doctorId: string, dayOfWeek: number) => {
    return prisma.availability.findMany({
      where: { doctorId, dayOfWeek },
    });
  },

  // Any leave covering this specific date
  getLeaveForDate: async (doctorId: string, date: Date) => {
    return prisma.doctorLeave.findFirst({
      where: {
        doctorId,
        dateFrom: { lte: date },
        dateTo: { gte: date },
      },
    });
  },

  // Already-booked start times for this doctor on this date
  getBookedStartTimes: async (doctorId: string, date: Date) => {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId, date, status: { in: ["confirmed", "in_consultation"] } },
      select: { startTime: true },
    });
    return appointments.map((a) => a.startTime).filter((t): t is string => t !== null);
  },
};

export const appointmentRepo = {
  // Books a slot only if it's still free — all inside one transaction so two
  // requests racing for the same slot can't both succeed.
  bookIfFree: async (params: {
    patientId: string;
    doctorId: string;
    date: Date;
    startTime: string;
  }) => {
    return prisma.$transaction(async (tx) => {
      const clash = await tx.appointment.findFirst({
        where: {
          doctorId: params.doctorId,
          date: params.date,
          startTime: params.startTime,
          status: { in: ["confirmed", "in_consultation"] },
        },
      });

      if (clash) {
        return null; // slot taken — caller reports a conflict
      }

      return tx.appointment.create({
        data: {
          patientId: params.patientId,
          doctorId: params.doctorId,
          type: "SCHEDULED",
          status: "confirmed",
          date: params.date,
          startTime: params.startTime,
        },
      });
    });
  },
};

export const appointmentCancelRepo = {
  // Patient-scoped: only cancels if this appointment belongs to this patient.
  // Same "0 rows = not found/not yours" pattern as Doctor's clinic isolation.
  cancelById: async (id: string, patientId: string) => {
    const result = await prisma.appointment.updateMany({
      where: { id, patientId, status: "confirmed" },
      data: { status: "cancelled" },
    });
    return result.count;
  },
};
