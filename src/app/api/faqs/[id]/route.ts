import { withAuth } from "@/server/middleware/withAuth";
import { updateFaq, deleteFaq } from "@/server/controllers/faq.controller";

function getId(url: string) {
  return url.split("/faqs/")[1]?.split("?")[0];
}

export const PATCH = withAuth(async (req, actor) => {
  const id = getId(req.url);
  if (!id) return new Response("Missing id", { status: 400 });
  return updateFaq(req, actor, id);
});

export const DELETE = withAuth(async (req, actor) => {
  const id = getId(req.url);
  if (!id) return new Response("Missing id", { status: 400 });
  return deleteFaq(actor, id);
});
