import { z } from "zod";

export const faqCreateSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
}).strict();

export const faqUpdateSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
}).strict();

export type FaqCreateInput = z.infer<typeof faqCreateSchema>;
export type FaqUpdateInput = z.infer<typeof faqUpdateSchema>;
