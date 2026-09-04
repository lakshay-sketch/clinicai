import { NextResponse } from "next/server";
import { doctorLeaveService } from "@/server/services/doctorLeave.service";
import { createLeaveSchema } from "@/server/validation/doctorLeave.validation";
import { requireRole } from "@/server/middleware/requireRole";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";
import type { Actor } from "@/server/middleware/withAuth";

export async function createLeave(req: Request, actor: Actor, doctorId: string) {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });
    const rawBody = await req.json();
    const parsed = createLeaveSchema.safeParse(rawBody);
    if (!parsed.success) throw new ValidationError("Invalid leave payload", parsed.error.flatten());

    const leave = await doctorLeaveService.create(actor, doctorId, parsed.data);
    const body: ApiResponse<typeof leave> = { success: true, data: leave };
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

export async function listLeave(req: Request, actor: Actor, doctorId: string) {
  try {
    requireRole(actor, { type: "STAFF" });
    const leaves = await doctorLeaveService.listForDoctor(actor, doctorId);
    const body: ApiResponse<typeof leaves> = { success: true, data: leaves };
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

export async function deleteLeave(req: Request, actor: Actor, leaveId: string) {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });
    await doctorLeaveService.delete(actor, leaveId);
    const body: ApiResponse<{ deleted: true }> = { success: true, data: { deleted: true } };
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
