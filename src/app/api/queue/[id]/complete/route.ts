import { withAuth } from "@/server/middleware/withAuth";
import { performQueueAction } from "@/server/controllers/queue.controller";
export const POST = withAuth(async (req, actor) => {
  const id = req.url.split("/queue/")[1]?.split("/complete")[0];
  if (!id) return new Response("Missing id", { status: 400 });
  return performQueueAction(actor, "complete", id);
});
