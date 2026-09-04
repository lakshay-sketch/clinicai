import { withAuth } from "@/server/middleware/withAuth";
import { getMyClinic, updateMyClinic } from "@/server/controllers/clinic.controller";

export const GET = withAuth(async (req, actor) => getMyClinic(actor));
export const PATCH = withAuth(async (req, actor) => updateMyClinic(req, actor));
