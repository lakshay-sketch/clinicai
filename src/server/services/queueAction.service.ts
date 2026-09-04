import { queueActionRepo, queueCompleteFixRepo } from "@/server/repositories/queue.repo";
import { NotFoundError } from "@/server/lib/errors";
import type { Actor } from "@/server/middleware/withAuth";

type ActionType = "call" | "skip" | "complete";

export const queueActionService = {
  perform: async (actor: Actor, action: ActionType, queueEntryId: string) => {
    if (actor.type !== "STAFF") throw new NotFoundError("Queue entry not found");

    const belongs = await queueActionRepo.entryBelongsToClinic(queueEntryId, actor.clinicId);
    if (!belongs) throw new NotFoundError("Queue entry not found");

    if (action === "complete") {
      await queueCompleteFixRepo.completeWithAppointment(queueEntryId);
    } else {
      const count =
        action === "call" ? await queueActionRepo.call(queueEntryId) : await queueActionRepo.skip(queueEntryId);
      if (count === 0) throw new NotFoundError("Queue entry not found");
    }

    const auditAction = action === "call" ? "CALLED" : action === "skip" ? "SKIPPED" : "COMPLETED";
    await queueActionRepo.writeAuditLog(queueEntryId, actor.id, auditAction);
  },
};
