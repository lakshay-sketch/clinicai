import { NextResponse } from "next/server";
import { withAuth } from "@/server/middleware/withAuth";
import type { ApiResponse } from "@/types/api/api-response.types";

export const GET = withAuth(async (req, actor) => {
  const body: ApiResponse<typeof actor> = {
    success: true,
    data: actor,
  };
  return NextResponse.json(body, { status: 200 });
});
