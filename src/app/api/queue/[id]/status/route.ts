import { getQueueStatus } from "@/server/controllers/queue.controller";
export async function GET(req: Request) {
  const doctorId = req.url.split("/queue/")[1]?.split("/status")[0];
  if (!doctorId) return new Response("Missing id", { status: 400 });
  return getQueueStatus(doctorId);
}
