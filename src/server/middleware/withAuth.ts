import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/server/lib/prisma";
import type { ApiResponse } from "@/types/api/api-response.types";

export type Actor =
  | { type: "PATIENT"; id: string; clerkUserId: string }
  | { type: "STAFF"; id: string; clerkUserId: string; clinicId: string; role: string };

type AuthenticatedHandler = (
  req: Request,
  actor: Actor
) => Promise<Response>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: Request) => {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      const body: ApiResponse<never> = {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Sign-in required" },
      };
      return NextResponse.json(body, { status: 401 });
    }

    const patient = await prisma.patient.findUnique({
      where: { clerkUserId },
    });
    if (patient) {
      return handler(req, { type: "PATIENT", id: patient.id, clerkUserId });
    }

    const staff = await prisma.staffUser.findUnique({
      where: { clerkUserId },
    });
    if (staff) {
      return handler(req, {
        type: "STAFF",
        id: staff.id,
        clerkUserId,
        clinicId: staff.clinicId,
        role: staff.role,
      });
    }

    const body: ApiResponse<never> = {
      success: false,
      error: {
        code: "ACCOUNT_NOT_PROVISIONED",
        message: "No matching Patient or StaffUser record found for this account",
      },
    };
    return NextResponse.json(body, { status: 401 });
  };
}
