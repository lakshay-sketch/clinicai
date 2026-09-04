import { withAuth } from "@/server/middleware/withAuth";
import { updateDoctor } from "@/server/controllers/doctor.controller";

export const PATCH = withAuth(async (req, actor) => {
  const id = req.url.split("/doctors/")[1]?.split("?")[0];
  if (!id) {
    return new Response("Missing doctor id", { status: 400 });
  }
  return updateDoctor(req, actor, id);
});
