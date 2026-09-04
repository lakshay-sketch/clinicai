import { doctorLeaveRepo } from "@/server/repositories/doctorLeave.repo";
import { NotFoundError } from "@/server/lib/errors";
import type { Actor } from "@/server/middleware/withAuth";
import type { CreateLeaveInput } from "@/server/validation/doctorLeave.validation";

export const doctorLeaveService = {
  create: async (actor: Actor, doctorId: string, data: CreateLeaveInput) => {
    if (actor.type !== "STAFF") throw new NotFoundError("Doctor not found");

    const belongs = await doctorLeaveRepo.doctorBelongsToClinic(doctorId, actor.clinicId);
    if (!belongs) throw new NotFoundError("Doctor not found");

    return doctorLeaveRepo.create(doctorId, {
      dateFrom: new Date(`${data.dateFrom}T00:00:00.000Z`),
      dateTo: new Date(`${data.dateTo}T00:00:00.000Z`),
      leaveType: data.leaveType,
      customStartTime: data.customStartTime,
      customEndTime: data.customEndTime,
      reason: data.reason,
    });
  },

  listForDoctor: async (actor: Actor, doctorId: string) => {
    if (actor.type !== "STAFF") throw new NotFoundError("Doctor not found");

    const belongs = await doctorLeaveRepo.doctorBelongsToClinic(doctorId, actor.clinicId);
    if (!belongs) throw new NotFoundError("Doctor not found");

    return doctorLeaveRepo.listForDoctor(doctorId);
  },

  delete: async (actor: Actor, leaveId: string) => {
    if (actor.type !== "STAFF") throw new NotFoundError("Leave not found");

    const count = await doctorLeaveRepo.deleteById(leaveId, actor.clinicId);
    if (count === 0) throw new NotFoundError("Leave not found");
  },
};
