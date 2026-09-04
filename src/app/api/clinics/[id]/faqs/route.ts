import { listFaqs } from "@/server/controllers/faq.controller";
export async function GET(req: Request) {
  const clinicId = req.url.split("/clinics/")[1]?.split("/faqs")[0];
  if (!clinicId) return new Response("Missing id", { status: 400 });
  return listFaqs(clinicId);
}
