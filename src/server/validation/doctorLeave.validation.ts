import { z } from "zod";

export const createLeaveSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  leaveType: z.enum(["FULL_DAY", "PARTIAL_DAY"]).default("FULL_DAY"),
  customStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  customEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  reason: z.string().optional(),
}).strict();

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
