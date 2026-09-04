import { getAvailability } from "@/server/controllers/availability.controller";

export async function GET(req: Request) {
  const doctorId = req.url.split("/doctors/")[1]?.split("/availability")[0];
  if (!doctorId) {
    return new Response("Missing doctor id", { status: 400 });
  }
  return getAvailability(req, doctorId);
}
