import { reviewRepo } from "@/server/repositories/review.repo";
import { NotFoundError, ValidationError } from "@/server/lib/errors";
import type { Actor } from "@/server/middleware/withAuth";
import type { ReviewCreateInput } from "@/server/validation/review.validation";

export const reviewService = {
  create: async (actor: Actor, data: ReviewCreateInput) => {
    if (actor.type !== "PATIENT") throw new NotFoundError("Not permitted");

    const appointment = await reviewRepo.getAppointment(data.appointmentId);
    if (!appointment) throw new NotFoundError("Appointment not found");
    if (appointment.patientId !== actor.id) throw new NotFoundError("Appointment not found");
    if (appointment.status !== "completed") {
      throw new ValidationError("You can only review a completed appointment");
    }

    try {
      return await reviewRepo.createAndRecompute({
        patientId: actor.id,
        doctorId: appointment.doctorId,
        appointmentId: appointment.id,
        rating: data.rating,
        reviewText: data.reviewText,
      });
    } catch {
      // Unique constraint on appointmentId — already reviewed
      throw new ValidationError("This appointment has already been reviewed");
    }
  },
};
