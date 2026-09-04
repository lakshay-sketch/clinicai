import { resolveClinicQr } from "@/server/controllers/clinicQr.controller";

export async function GET(req: Request) {
  const token = req.url.split("/qr/")[1]?.split("?")[0];
  if (!token) return new Response("Missing token", { status: 400 });
  return resolveClinicQr(token);
}
