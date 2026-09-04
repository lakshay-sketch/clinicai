import { NextResponse } from "next/server";
import { reviewService } from "@/server/services/review.service";
import { reviewCreateSchema } from "@/server/validation/review.validation";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";
import type { Actor } from "@/server/middleware/withAuth";

export async function createReview(req: Request, actor: Actor) {
  try {
    const rawBody = await req.json();
    const parsed = reviewCreateSchema.safeParse(rawBody);
    if (!parsed.success) throw new ValidationError("Invalid payload", parsed.error.flatten());

    const review = await reviewService.create(actor, parsed.data);
    const body: ApiResponse<typeof review> = { success: true, data: review };
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
