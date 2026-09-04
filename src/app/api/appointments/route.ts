import { withAuth } from "@/server/middleware/withAuth";
import { bookAppointment } from "@/server/controllers/availability.controller";

export const POST = withAuth(async (req, actor) => {
  return bookAppointment(req, actor);
});
