import { withAuth } from "@/server/middleware/withAuth";
import { cancelAppointment } from "@/server/controllers/availability.controller";

export const PATCH = withAuth(async (req, actor) => {
  const id = req.url.split("/appointments/")[1]?.split("/cancel")[0];
  if (!id) return new Response("Missing id", { status: 400 });
  return cancelAppointment(req, actor, id);
});
