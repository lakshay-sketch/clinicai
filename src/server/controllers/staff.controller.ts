import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { staffService } from "@/server/services/staff.service";
import { staffInviteSchema } from "@/server/validation/staff.validation";
import { requireRole } from "@/server/middleware/requireRole";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";
import type { Actor } from "@/server/middleware/withAuth";

export async function inviteStaff(req: Request, actor: Actor) {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });
    const rawBody = await req.json();
    const parsed = staffInviteSchema.safeParse(rawBody);
    if (!parsed.success) throw new ValidationError("Invalid payload", parsed.error.flatten());

    const staff = await staffService.invite(actor, parsed.data);
    const body: ApiResponse<typeof staff> = { success: true, data: staff };
    return NextResponse.json(body, { status: 201 });
  } catch (err) {
    try {
      writeFileSync("/tmp/staff_invite_error.log", JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2));
    } catch {}
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = {
      success: false,
      error: { code: appError.code, message: appError.message, details: appError.details },
    };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}
