import { clinicRepo } from "@/server/repositories/clinic.repo";
import { NotFoundError } from "@/server/lib/errors";
import type { Actor } from "@/server/middleware/withAuth";
import type { ClinicUpdateInput } from "@/server/validation/clinic.validation";

export const clinicService = {
  getMine: async (actor: Actor) => {
    if (actor.type !== "STAFF") throw new NotFoundError("Clinic not found");
    const clinic = await clinicRepo.findById(actor.clinicId);
    if (!clinic) throw new NotFoundError("Clinic not found");
    return clinic;
  },

  updateMine: async (actor: Actor, data: ClinicUpdateInput) => {
    if (actor.type !== "STAFF") throw new NotFoundError("Clinic not found");
    return clinicRepo.updateById(actor.clinicId, data);
  },
};
