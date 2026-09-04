import { NextResponse } from "next/server";
import { withAuth } from "@/server/middleware/withAuth";
import { requireRole } from "@/server/middleware/requireRole";
import { AppError, InternalError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";

export const GET = withAuth(async (req, actor) => {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });

    const body: ApiResponse<{ message: string; clinicId: string }> = {
      success: true,
      data: { message: "You are an admin.", clinicId: actor.type === "STAFF" ? actor.clinicId : "" },
    };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = {
      success: false,
      error: { code: appError.code, message: appError.message },
    };
    return NextResponse.json(body, { status: appError.statusCode });
  }
});
