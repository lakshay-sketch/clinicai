import { z } from "zod";

export const chatMessageSchema = z.object({
  clinicId: z.string().min(1),
  message: z.string().min(1),
}).strict();

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
