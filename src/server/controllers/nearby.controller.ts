import { NextResponse } from "next/server";
import { nearbyService } from "@/server/services/nearby.service";
import { nearbyQuerySchema } from "@/server/validation/nearby.validation";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";

export async function findNearbyDoctors(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = Object.fromEntries(searchParams.entries());
    const parsed = nearbyQuerySchema.safeParse(rawQuery);
    if (!parsed.success) throw new ValidationError("Invalid query parameters", parsed.error.flatten());

    const doctors = await nearbyService.findNearby(parsed.data);
    const body: ApiResponse<typeof doctors> = { success: true, data: doctors };
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
