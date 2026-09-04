import { withAuth } from "@/server/middleware/withAuth";
import { joinQueue } from "@/server/controllers/queue.controller";

export const POST = withAuth(async (req, actor) => {
  return joinQueue(req, actor);
});
