import { NextResponse } from "next/server";
import { faqService } from "@/server/services/faq.service";
import { faqCreateSchema, faqUpdateSchema } from "@/server/validation/faq.validation";
import { requireRole } from "@/server/middleware/requireRole";
import { AppError, InternalError, ValidationError } from "@/server/lib/errors";
import type { ApiResponse } from "@/types/api/api-response.types";
import type { Actor } from "@/server/middleware/withAuth";

export async function listFaqs(clinicId: string) {
  try {
    const faqs = await faqService.listForClinic(clinicId);
    const body: ApiResponse<typeof faqs> = { success: true, data: faqs };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = { success: false, error: { code: appError.code, message: appError.message } };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}

export async function createFaq(req: Request, actor: Actor) {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });
    const rawBody = await req.json();
    const parsed = faqCreateSchema.safeParse(rawBody);
    if (!parsed.success) throw new ValidationError("Invalid payload", parsed.error.flatten());

    const faq = await faqService.create(actor, parsed.data);
    const body: ApiResponse<typeof faq> = { success: true, data: faq };
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

export async function updateFaq(req: Request, actor: Actor, faqId: string) {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });
    const rawBody = await req.json();
    const parsed = faqUpdateSchema.safeParse(rawBody);
    if (!parsed.success) throw new ValidationError("Invalid payload", parsed.error.flatten());

    await faqService.update(actor, faqId, parsed.data);
    const body: ApiResponse<{ updated: true }> = { success: true, data: { updated: true } };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = { success: false, error: { code: appError.code, message: appError.message } };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}

export async function deleteFaq(actor: Actor, faqId: string) {
  try {
    requireRole(actor, { type: "STAFF", roles: ["ADMIN"] });
    await faqService.delete(actor, faqId);
    const body: ApiResponse<{ deleted: true }> = { success: true, data: { deleted: true } };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    const appError = err instanceof AppError ? err : new InternalError(undefined, err);
    const body: ApiResponse<never> = { success: false, error: { code: appError.code, message: appError.message } };
    return NextResponse.json(body, { status: appError.statusCode });
  }
}
