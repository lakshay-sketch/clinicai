import { queueRepo } from "@/server/repositories/queue.repo";
import { NotFoundError } from "@/server/lib/errors";
import type { Actor } from "@/server/middleware/withAuth";

export const queueService = {
  join: async (actor: Actor, doctorId: string) => {
    if (actor.type !== "PATIENT") throw new NotFoundError("Not permitted");
    return queueRepo.join(actor.id, doctorId);
  },
};
