import { searchDoctors } from "@/server/controllers/doctor.controller";

export async function GET(req: Request) {
  return searchDoctors(req);
}
