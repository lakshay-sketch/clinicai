import { z } from "zod";

export const staffInviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "RECEPTION"]),
}).strict();

export type StaffInviteInput = z.infer<typeof staffInviteSchema>;
