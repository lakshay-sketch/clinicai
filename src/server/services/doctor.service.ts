import { doctorRepo } from "@/server/repositories/doctor.repo";
import { NotFoundError } from "@/server/lib/errors";
import type { Actor } from "@/server/middleware/withAuth";
import type {
  DoctorSearchQuery,
  DoctorUpdateInput,
  DoctorCreateInput,
} from "@/server/validation/doctor.validation";

export const doctorService = {
  search: async (query: DoctorSearchQuery) => {
    const { doctors, total } = await doctorRepo.search(query);
    const totalPages = Math.ceil(total / query.pageSize);

    return {
      doctors,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages,
      },
    };
  },

  updateForClinic: async (actor: Actor, doctorId: string, data: DoctorUpdateInput) => {
    if (actor.type !== "STAFF") {
      throw new NotFoundError("Doctor not found");
    }

    const updatedCount = await doctorRepo.updateById(doctorId, actor.clinicId, data);

    if (updatedCount === 0) {
      throw new NotFoundError("Doctor not found");
    }
  },

  // Create a doctor scoped to the actor's own clinic. clinicId is taken
  // exclusively from actor.clinicId. specializationId is pulled OUT of the
  // spread before building the Prisma payload — Prisma's nested-write create
  // syntax requires `specialization: { connect: { id } }`, and having a
  // stray flat `specializationId` key alongside that relational object in
  // the same payload is invalid and throws PrismaClientValidationError.
  createForClinic: async (actor: Actor, data: DoctorCreateInput) => {
    if (actor.type !== "STAFF") {
      throw new NotFoundError("Not permitted");
    }

    const { specializationId, ...rest } = data;

    return doctorRepo.create({
      ...rest,
      clinic: { connect: { id: actor.clinicId } },
      specialization: { connect: { id: specializationId } },
    });
  },
};
