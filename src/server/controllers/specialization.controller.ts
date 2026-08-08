import { NextResponse } from "next/server";
import { specializationService } from "@/server/services/specialization.service";
import { AppError, InternalError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";

export async function getSpecializations() {
  try {
    const specializations = await specializationService.listAll();

    const body: ApiResponse<typeof specializations> = {
      success: true,
      data: specializations,
    };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const appError =
      err instanceof AppError ? err : new InternalError(undefined, err);

    const body: ApiResponse<never> = {
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
      },
    };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}
