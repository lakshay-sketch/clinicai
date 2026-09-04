import { NextResponse } from "next/server";
import { clinicService } from "@/server/services/clinic.service";
import { clinicUpdateSchema } from "@/server/validation/clinic.validation";
import { requireRole } from "@/server/middleware/requireRole";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";
import type { Actor } from "@/server/middleware/withAuth";

export async function getMyClinic(actor: Actor) {
  try {
    requireRole(actor, { type: "STAFF" });
    const clinic = await clinicService.getMine(actor);
    const body: ApiResponse<typeof clinic> = { success: true, data: clinic };
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

export async function updateMyClinic(req: Request, actor: Actor) {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });
    const rawBody = await req.json();
    const parsed = clinicUpdateSchema.safeParse(rawBody);
    if (!parsed.success) throw new ValidationError("Invalid payload", parsed.error.flatten());

    const clinic = await clinicService.updateMine(actor, parsed.data);
    const body: ApiResponse<typeof clinic> = { success: true, data: clinic };
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
