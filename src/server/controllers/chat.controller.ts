import { NextResponse } from "next/server";
import { orchestratorService } from "@/server/services/orchestrator.service";
import { chatMessageSchema } from "@/server/validation/chat.validation";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";

export async function handleChatMessage(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = chatMessageSchema.safeParse(rawBody);
    if (!parsed.success) throw new ValidationError("Invalid payload", parsed.error.flatten());

    const result = await orchestratorService.handle(parsed.data.clinicId, parsed.data.message);
    const body: ApiResponse<typeof result> = { success: true, data: result };
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
