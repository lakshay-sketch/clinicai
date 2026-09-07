import { findNearbyDoctors } from "@/server/controllers/nearby.controller";

export async function GET(req: Request) {
  return findNearbyDoctors(req);
}
