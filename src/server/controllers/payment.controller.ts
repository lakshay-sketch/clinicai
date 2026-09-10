import { NextResponse } from "next/server";
import { paymentService } from "@/server/services/payment.service";
import { verifyPaymentSchema } from "@/server/validation/payment.validation";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";
import type { Actor } from "@/server/middleware/withAuth";

export async function createPaymentOrder(req: Request, actor: Actor, appointmentId: string) {
  try {
    const order = await paymentService.createOrder(actor, appointmentId);
    const body: ApiResponse<typeof order> = { success: true, data: order };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = {
      success: false,
      error: { code: appError.code, message: appError.message, details: appError.details },
    };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}

export async function verifyPayment(req: Request, actor: Actor, appointmentId: string) {
  try {
    const rawBody = await req.json();
    const parsed = verifyPaymentSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new ValidationError("Invalid payment payload", parsed.error.flatten());
    }

    const appointment = await paymentService.verify(actor, appointmentId, parsed.data);
    const body: ApiResponse<typeof appointment> = { success: true, data: appointment };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = {
      success: false,
      error: { code: appError.code, message: appError.message, details: appError.details },
    };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}
