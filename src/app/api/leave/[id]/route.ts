import { withAuth } from "@/server/middleware/withAuth";
import { deleteLeave } from "@/server/controllers/doctorLeave.controller";

export const DELETE = withAuth(async (req, actor) => {
  const id = req.url.split("/leave/")[1]?.split("?")[0];
  if (!id) return new Response("Missing id", { status: 400 });
  return deleteLeave(req, actor, id);
});
