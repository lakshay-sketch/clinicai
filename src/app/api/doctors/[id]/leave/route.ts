import { withAuth } from "@/server/middleware/withAuth";
import { createLeave, listLeave } from "@/server/controllers/doctorLeave.controller";

function getDoctorId(url: string) {
  return url.split("/doctors/")[1]?.split("/leave")[0];
}

export const POST = withAuth(async (req, actor) => {
  const id = getDoctorId(req.url);
  if (!id) return new Response("Missing id", { status: 400 });
  return createLeave(req, actor, id);
});

export const GET = withAuth(async (req, actor) => {
  const id = getDoctorId(req.url);
  if (!id) return new Response("Missing id", { status: 400 });
  return listLeave(req, actor, id);
});
