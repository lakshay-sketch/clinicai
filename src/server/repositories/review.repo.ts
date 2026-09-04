import { prisma } from "@/server/lib/prisma";

export const reviewRepo = {
  getAppointment: async (appointmentId: string) => {
    return prisma.appointment.findUnique({ where: { id: appointmentId } });
  },

  // Creates the Review AND recomputes the doctor's avgRating/reviewCount in
  // one transaction — the review insert and the aggregate update must never
  // land out of sync with each other.
  createAndRecompute: async (params: {
    patientId: string;
    doctorId: string;
    appointmentId: string;
    rating: number;
    reviewText?: string;
  }) => {
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          patient: { connect: { id: params.patientId } },
          doctor: { connect: { id: params.doctorId } },
          appointment: { connect: { id: params.appointmentId } },
          rating: params.rating,
          reviewText: params.reviewText,
        },
      });

      const agg = await tx.review.aggregate({
        where: { doctorId: params.doctorId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.doctor.update({
        where: { id: params.doctorId },
        data: {
          avgRating: agg._avg.rating ?? 0,
          reviewCount: agg._count.rating,
        },
      });

      return review;
    });
  },
};
