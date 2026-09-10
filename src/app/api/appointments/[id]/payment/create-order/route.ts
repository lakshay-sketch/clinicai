import { withAuth } from "@/server/middleware/withAuth";
import { createPaymentOrder } from "@/server/controllers/payment.controller";

export const POST = withAuth(async (req, actor) => {
  const id = req.url.split("/appointments/")[1]?.split("/payment")[0];
  if (!id) return new Response("Missing id", { status: 400 });
  return createPaymentOrder(req, actor, id);
});
