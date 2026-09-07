import { z } from "zod";

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(100).default(10),
  specializationId: z.string().optional(),
});

export type NearbyQuery = z.infer<typeof nearbyQuerySchema>;
