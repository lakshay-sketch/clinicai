import { NextResponse } from "next/server";
import { availabilityService } from "@/server/services/availability.service";
import { availabilityQuerySchema } from "@/server/validation/availability.validation";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";

export async function getAvailability(req: Request, doctorId: string) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = Object.fromEntries(searchParams.entries());

    const parsed = availabilityQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters", parsed.error.flatten());
    }

    const slots = await availabilityService.getSlotsForDate(doctorId, parsed.data.date);

    const body: ApiResponse<{ date: string; slots: string[] }> = {
      success: true,
      data: { date: parsed.data.date, slots },
    };
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

import { appointmentService } from "@/server/services/availability.service";
import { bookAppointmentSchema } from "@/server/validation/availability.validation";
import type { Actor } from "@/server/middleware/withAuth";

export async function bookAppointment(req: Request, actor: Actor) {
  try {
    const rawBody = await req.json();
    const parsed = bookAppointmentSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new ValidationError("Invalid booking payload", parsed.error.flatten());
    }

    const appointment = await appointmentService.book(actor, parsed.data);

    const body: ApiResponse<typeof appointment> = {
      success: true,
      data: appointment,
    };
    return NextResponse.json(body, { status: 201 });
  } catch (err) {
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = {
      success: false,
      error: { code: appError.code, message: appError.message, details: appError.details },
    };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}

import { appointmentCancelService } from "@/server/services/availability.service";

export async function cancelAppointment(req: Request, actor: Actor, appointmentId: string) {
  try {
    await appointmentCancelService.cancel(actor, appointmentId);
    const body: ApiResponse<{ cancelled: true }> = { success: true, data: { cancelled: true } };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = {
      success: false,
      error: { code: appError.code, message: appError.message },
    };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}
