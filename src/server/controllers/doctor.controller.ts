import { NextResponse } from "next/server";
import { doctorService } from "@/server/services/doctor.service";
import {
  doctorSearchQuerySchema,
  doctorUpdateSchema,
  doctorCreateSchema,
} from "@/server/validation/doctor.validation";
import { requireRole } from "@/server/middleware/requireRole";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";
import type { Actor } from "@/server/middleware/withAuth";

export async function searchDoctors(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = Object.fromEntries(searchParams.entries());

    const parsed = doctorSearchQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new ValidationError("Invalid search parameters", parsed.error.flatten());
    }

    const { doctors, meta } = await doctorService.search(parsed.data);

    const body: ApiResponse<typeof doctors> = {
      success: true,
      data: doctors,
      meta,
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

export async function updateDoctor(req: Request, actor: Actor, doctorId: string) {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });

    const rawBody = await req.json();
    const parsed = doctorUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new ValidationError("Invalid update payload", parsed.error.flatten());
    }

    await doctorService.updateForClinic(actor, doctorId, parsed.data);

    const body: ApiResponse<{ id: string; updated: true }> = {
      success: true,
      data: { id: doctorId, updated: true },
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

export async function createDoctor(req: Request, actor: Actor) {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });

    const rawBody = await req.json();
    const parsed = doctorCreateSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new ValidationError("Invalid create payload", parsed.error.flatten());
    }

    const doctor = await doctorService.createForClinic(actor, parsed.data);

    const body: ApiResponse<typeof doctor> = {
      success: true,
      data: doctor,
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

export async function deactivateDoctor(actor: Actor, doctorId: string) {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });
    await doctorService.updateForClinic(actor, doctorId, { isActive: false });
    const body: ApiResponse<{ deactivated: true }> = { success: true, data: { deactivated: true } };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = { success: false, error: { code: appError.code, message: appError.message } };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}
