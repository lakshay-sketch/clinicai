import { staffRepo } from "@/server/repositories/staff.repo";
import { ValidationError, NotFoundError } from "@/server/lib/errors";
import type { Actor } from "@/server/middleware/withAuth";
import type { StaffInviteInput } from "@/server/validation/staff.validation";

export const staffService = {
  invite: async (actor: Actor, data: StaffInviteInput) => {
    if (actor.type !== "STAFF") throw new NotFoundError("Not permitted");

    const existing = await staffRepo.findByEmail(data.email);
    if (existing) throw new ValidationError("A staff account with this email already exists");

    return staffRepo.createInvite(actor.clinicId, data.email, data.name, data.role);
  },
};
