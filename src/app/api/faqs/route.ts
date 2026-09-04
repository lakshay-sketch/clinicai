import { withAuth } from "@/server/middleware/withAuth";
import { createFaq } from "@/server/controllers/faq.controller";
export const POST = withAuth(async (req, actor) => createFaq(req, actor));
