import { withAuth } from "@/server/middleware/withAuth";
import { inviteStaff } from "@/server/controllers/staff.controller";

export const POST = withAuth(async (req, actor) => inviteStaff(req, actor));
