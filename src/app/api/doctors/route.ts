import { searchDoctors, createDoctor } from "@/server/controllers/doctor.controller";
import { withAuth } from "@/server/middleware/withAuth";

export async function GET(req: Request) {
  return searchDoctors(req);
}

export const POST = withAuth(async (req, actor) => {
  return createDoctor(req, actor);
});
