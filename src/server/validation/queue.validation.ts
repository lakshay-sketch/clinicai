import { z } from "zod";

export const joinQueueSchema = z.object({
  doctorId: z.string().min(1),
}).strict();

export type JoinQueueInput = z.infer<typeof joinQueueSchema>;
