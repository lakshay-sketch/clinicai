import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { clinicQrService } from "@/server/services/clinicQr.service";
import { AppError, InternalError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";

export async function resolveClinicQr(qrToken: string) {
  try {
    const clinic = await clinicQrService.resolve(qrToken);
    const body: ApiResponse<typeof clinic> = { success: true, data: clinic };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    try {
      writeFileSync("/tmp/qr_error.log", JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2));
    } catch {}
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = {
      success: false,
      error: { code: appError.code, message: appError.message, details: appError.details },
    };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}
