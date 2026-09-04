import { withAuth } from "@/server/middleware/withAuth";
import { createReview } from "@/server/controllers/review.controller";
export const POST = withAuth(async (req, actor) => createReview(req, actor));
