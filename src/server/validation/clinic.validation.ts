import { z } from "zod";

export const clinicUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  area: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  pincode: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  logoUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  photoUrls: z.array(z.string().url()).optional(),
}).strict();

export type ClinicUpdateInput = z.infer<typeof clinicUpdateSchema>;
