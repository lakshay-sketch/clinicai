import { nearbyRepo } from "@/server/repositories/nearby.repo";
import type { NearbyQuery } from "@/server/validation/nearby.validation";

// Standard Haversine formula — distance in km between two lat/lng points.
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const nearbyService = {
  findNearby: async (query: NearbyQuery) => {
    const doctors = await nearbyRepo.findActiveDoctorsWithCoords(query.specializationId);

    const withDistance = doctors
      .map((doc) => ({
        ...doc,
        distanceKm: distanceKm(query.lat, query.lng, doc.clinic.latitude, doc.clinic.longitude),
      }))
      .filter((doc) => doc.distanceKm <= query.radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return withDistance;
  },
};
