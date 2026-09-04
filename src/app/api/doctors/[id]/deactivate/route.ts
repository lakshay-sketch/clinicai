import { withAuth } from "@/server/middleware/withAuth";
import { deactivateDoctor } from "@/server/controllers/doctor.controller";

export const POST = withAuth(async (req, actor) => {
  const id = req.url.split("/doctors/")[1]?.split("/deactivate")[0];
  if (!id) return new Response("Missing id", { status: 400 });
  return deactivateDoctor(actor, id);
});
