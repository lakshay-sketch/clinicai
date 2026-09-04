import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { queueService } from "@/server/services/queue.service";
import { joinQueueSchema } from "@/server/validation/queue.validation";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";
import type { Actor } from "@/server/middleware/withAuth";

export async function joinQueue(req: Request, actor: Actor) {
  try {
    const rawBody = await req.json();
    const parsed = joinQueueSchema.safeParse(rawBody);
    if (!parsed.success) throw new ValidationError("Invalid payload", parsed.error.flatten());

    const entry = await queueService.join(actor, parsed.data.doctorId);
    const body: ApiResponse<typeof entry> = { success: true, data: entry };
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

import { queueStatusService } from "@/server/services/queueStatus.service";

export async function getQueueStatus(doctorId: string) {
  try {
    const status = await queueStatusService.getStatus(doctorId);
    const body: ApiResponse<typeof status> = { success: true, data: status };
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

import { queueActionService } from "@/server/services/queueAction.service";
import { requireRole } from "@/server/middleware/requireRole";

export async function performQueueAction(
  actor: Actor,
  action: "call" | "skip" | "complete",
  queueEntryId: string
) {
  try {
    requireRole(actor, { type: "STAFF" });
    await queueActionService.perform(actor, action, queueEntryId);
    const body: ApiResponse<{ done: true }> = { success: true, data: { done: true } };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    try {
      writeFileSync("/tmp/queue_action_error.log", JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2));
    } catch {}
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = {
      success: false,
      error: { code: appError.code, message: appError.message },
    };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}
