import { getSpecializations } from "@/server/controllers/specialization.controller";

export async function GET() {
  return getSpecializations();
}
