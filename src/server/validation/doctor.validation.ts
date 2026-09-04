import { z } from "zod";

export const doctorSearchQuerySchema = z.object({
  specializationId: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  clinicId: z.string().optional(),
  sortBy: z
    .enum(["avgRating", "consultationFee", "experienceYears"])
    .default("avgRating"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type DoctorSearchQuery = z.infer<typeof doctorSearchQuerySchema>;

// Fields an Admin is allowed to edit on their own clinic's doctor.
// Deliberately excludes clinicId (can't reassign a doctor to another clinic
// via this endpoint) and id (immutable). specializationId IS editable here —
// re-tagging a doctor's specialty is a legitimate admin action, unlike
// clinic reassignment, which would be a data-integrity/ownership change.
export const doctorUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  qualification: z.string().min(1).optional(),
  specializationId: z.string().optional(),
  experienceYears: z.coerce.number().int().min(0).optional(),
  consultationFee: z.coerce.number().int().min(0).optional(),
  languages: z.array(z.string()).optional(),
  bio: z.string().optional(),
  slotDurationMinutes: z.coerce.number().int().min(1).optional(),
  avgConsultationMinutes: z.coerce.number().int().min(1).optional(),
  profileImageUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  isAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict(); // reject any field not explicitly listed above, e.g. clinicId, avgRating

export type DoctorUpdateInput = z.infer<typeof doctorUpdateSchema>;

// Fields required to create a new doctor. No clinicId field exists here at
// all — it is never accepted from the request. The service layer forces it
// to actor.clinicId, so it is structurally impossible for a request body to
// assign a new doctor to a clinic other than the creating admin's own.
export const doctorCreateSchema = z.object({
  name: z.string().min(1),
  qualification: z.string().min(1),
  specializationId: z.string().min(1),
  experienceYears: z.coerce.number().int().min(0),
  consultationFee: z.coerce.number().int().min(0),
  languages: z.array(z.string()).default([]),
  bio: z.string().default(""),
  slotDurationMinutes: z.coerce.number().int().min(1),
  avgConsultationMinutes: z.coerce.number().int().min(1),
  profileImageUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
}).strict();

export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;
