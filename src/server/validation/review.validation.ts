import { z } from "zod";

export const reviewCreateSchema = z.object({
  appointmentId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  reviewText: z.string().optional(),
}).strict();

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
