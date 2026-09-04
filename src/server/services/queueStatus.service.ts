import { queueStatusRepo } from "@/server/repositories/queue.repo";

export const queueStatusService = {
  getStatus: async (doctorId: string) => {
    return queueStatusRepo.getStatus(doctorId);
  },
};
