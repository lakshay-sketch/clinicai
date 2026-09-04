import { prisma } from "@/server/lib/prisma";

function todayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export const queueRepo = {
  join: async (patientId: string, doctorId: string) => {
    const queueDate = todayDateOnly();

    return prisma.$transaction(async (tx) => {
      const maxEntry = await tx.queueEntry.findFirst({
        where: { doctorId, queueDate },
        orderBy: { queueNumber: "desc" },
      });
      const nextNumber = (maxEntry?.queueNumber ?? 0) + 1;

      const appointment = await tx.appointment.create({
        data: {
          patientId,
          doctorId,
          type: "WALK_IN",
          status: "confirmed",
          date: queueDate,
        },
      });

      const queueEntry = await tx.queueEntry.create({
        data: {
          appointmentId: appointment.id,
          doctorId,
          queueDate,
          queueNumber: nextNumber,
          position: nextNumber,
          status: "waiting",
          joinedAt: new Date(),
        },
      });

      return queueEntry;
    });
  },
};

export const queueStatusRepo = {
  getStatus: async (doctorId: string) => {
    const queueDate = todayDateOnly();

    const entries = await prisma.queueEntry.findMany({
      where: { doctorId, queueDate, status: { in: ["waiting", "called", "in_consultation"] } },
      include: { appointment: { include: { patient: true } } },
      orderBy: { position: "asc" },
    });

    const currentlyServing = entries.find((e) => e.status === "in_consultation") ?? null;
    const waiting = entries.filter((e) => e.status === "waiting" || e.status === "called");

    return {
      doctorId,
      currentlyServing: currentlyServing
        ? {
            queueNumber: currentlyServing.queueNumber,
            patientName: currentlyServing.appointment.patient.name,
          }
        : null,
      waiting: waiting.map((e, idx) => ({
        queueEntryId: e.id,
        queueNumber: e.queueNumber,
        position: e.position,
        estimatedWaitMinutes: idx * 15,
      })),
    };
  },
};

export const queueActionRepo = {
  // QueueEntry has no direct `doctor` relation to filter on, so clinic
  // ownership is checked as a separate step first: confirm the doctor on
  // this entry belongs to the staff member's clinic, THEN update by id.
  entryBelongsToClinic: async (queueEntryId: string, clinicId: string) => {
    const entry = await prisma.queueEntry.findUnique({
      where: { id: queueEntryId },
      select: { doctorId: true },
    });
    if (!entry) return false;
    const doctor = await prisma.doctor.findFirst({
      where: { id: entry.doctorId, clinicId },
    });
    return doctor !== null;
  },

  call: async (queueEntryId: string) => {
    const result = await prisma.queueEntry.updateMany({
      where: { id: queueEntryId, status: "waiting" },
      data: { status: "called", calledAt: new Date() },
    });
    return result.count;
  },

  skip: async (queueEntryId: string) => {
    const result = await prisma.queueEntry.updateMany({
      where: { id: queueEntryId },
      data: { status: "skipped" },
    });
    return result.count;
  },

  complete: async (queueEntryId: string) => {
    const result = await prisma.queueEntry.updateMany({
      where: { id: queueEntryId },
      data: { status: "completed", consultationEndedAt: new Date() },
    });
    return result.count;
  },

  writeAuditLog: async (queueEntryId: string, staffUserId: string, action: "CALLED" | "SKIPPED" | "COMPLETED") => {
    return prisma.queueAuditLog.create({
      data: { queueEntryId, staffUserId, action },
    });
  },
};

export const queueCompleteFixRepo = {
  completeWithAppointment: async (queueEntryId: string) => {
    return prisma.$transaction(async (tx) => {
      const entry = await tx.queueEntry.update({
        where: { id: queueEntryId },
        data: { status: "completed", consultationEndedAt: new Date() },
      });
      await tx.appointment.update({
        where: { id: entry.appointmentId },
        data: { status: "completed" },
      });
      return entry;
    });
  },
};
