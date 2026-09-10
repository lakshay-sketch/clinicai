import { prisma } from "@/server/lib/prisma";

export const paymentRepo = {
  findForPayment: (appointmentId: string) =>
    prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true },
    }),

  attachOrder: (appointmentId: string, razorpayOrderId: string, depositAmount: number) =>
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { razorpayOrderId, depositAmount, depositStatus: "PENDING" },
    }),

  markPaid: (appointmentId: string, razorpayPaymentId: string) =>
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { razorpayPaymentId, depositStatus: "PAID", paidAt: new Date() },
    }),

  markFailed: (appointmentId: string) =>
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { depositStatus: "FAILED" },
    }),
};
