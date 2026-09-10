import crypto from "crypto";
import { razorpay } from "@/server/lib/razorpay";
import { paymentRepo } from "@/server/repositories/payment.repo";
import { ValidationError, NotFoundError } from "@/server/lib/errors";
import type { Actor } from "@/server/middleware/withAuth";

function calcDepositPaise(consultationFee: number) {
  const rupees = Math.max(50, Math.round(consultationFee * 0.2));
  return rupees * 100;
}

export const paymentService = {
  createOrder: async (actor: Actor, appointmentId: string) => {
    if (actor.type !== "PATIENT") throw new NotFoundError("Appointment not found");

    const appointment = await paymentRepo.findForPayment(appointmentId);
    if (!appointment || appointment.patientId !== actor.id) {
      throw new NotFoundError("Appointment not found");
    }
    if (appointment.type !== "SCHEDULED") {
      throw new ValidationError("Walk-in appointments don't require a deposit");
    }
    if (appointment.depositStatus === "PAID") {
      throw new ValidationError("Deposit already paid");
    }

    const amount = calcDepositPaise(appointment.doctor.consultationFee);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `appt_${appointmentId}`,
      notes: { appointmentId },
    });

    await paymentRepo.attachOrder(appointmentId, order.id, amount);

    return { orderId: order.id, amount, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID };
  },

  verify: async (
    actor: Actor,
    appointmentId: string,
    input: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
  ) => {
    if (actor.type !== "PATIENT") throw new NotFoundError("Appointment not found");

    const appointment = await paymentRepo.findForPayment(appointmentId);
    if (!appointment || appointment.patientId !== actor.id) {
      throw new NotFoundError("Appointment not found");
    }
    if (appointment.razorpayOrderId !== input.razorpay_order_id) {
      throw new ValidationError("Order mismatch");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== input.razorpay_signature) {
      await paymentRepo.markFailed(appointmentId);
      throw new ValidationError("Payment verification failed");
    }

    return paymentRepo.markPaid(appointmentId, input.razorpay_payment_id);
  },
};
