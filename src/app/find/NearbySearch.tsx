"use client";

import { useState } from "react";
import Link from "next/link";

type Doctor = {
  id: string;
  name: string;
  consultationFee: number;
  experienceYears: number;
  avgRating: number;
  reviewCount: number;
  distanceKm: number;
  specialization: { name: string };
  clinic: { name: string; area: string };
};

export default function NearbySearch({ specializationId }: { specializationId?: string }) {
  const [status, setStatus] = useState<"idle" | "locating" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  function useMyLocation() {
    setStatus("locating");
    setError(null);

    if (!navigator.geolocation) {
      setStatus("error");
      setError("Your browser doesn't support location services.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("loading");
        const { latitude, longitude } = position.coords;
        const url = new URL("/api/doctors/nearby", window.location.origin);
        url.searchParams.set("lat", String(latitude));
        url.searchParams.set("lng", String(longitude));
        url.searchParams.set("radiusKm", "15");
        if (specializationId) url.searchParams.set("specializationId", specializationId);

        const res = await fetch(url.toString());
        const json = await res.json();

        if (json.success) {
          setDoctors(json.data);
          setStatus("done");
        } else {
          setStatus("error");
          setError(json.error?.message ?? "Could not load nearby doctors");
        }
      },
      () => {
        setStatus("error");
        setError("Location access was denied. Enable it in your browser settings to see nearby doctors.");
      }
    );
  }

  return (
    <div className="mb-8">
      {status === "idle" && (
        <button
          onClick={useMyLocation}
          className="border border-line-strong text-ink text-sm px-4 py-2 hover:border-ink"
        >
          📍 Use my location to find nearby doctors
        </button>
      )}

      {(status === "locating" || status === "loading") && (
        <p className="text-sm text-ink-60">
          {status === "locating" ? "Getting your location…" : "Finding doctors near you…"}
        </p>
      )}

      {status === "error" && (
        <div>
          <p className="text-sm text-red">{error}</p>
          <button onClick={useMyLocation} className="text-sm text-teal underline mt-1">
            Try again
          </button>
        </div>
      )}

      {status === "done" && (
        <div>
          <p className="text-sm text-ink-60 mb-4">
            {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} found within 15 km
          </p>
          <div className="divide-y divide-line border-t border-b border-line">
            {doctors.map((doc) => (
              <Link
                key={doc.id}
                href={`/doctors/${doc.id}`}
                className="block py-5 hover:bg-line/10 -mx-2 px-2 transition-colors"
              >
                <div className="flex items-baseline justify-between">
                  <p className="text-ink font-medium">{doc.name}</p>
                  <p className="font-mono text-sm text-teal">{doc.distanceKm.toFixed(1)} km away</p>
                </div>
                <p className="text-sm text-ink-60 mt-0.5">
                  {doc.specialization.name} · {doc.clinic.name}, {doc.clinic.area}
                </p>
                <p className="text-sm text-ink-60 mt-0.5 font-mono">₹{doc.consultationFee}</p>
              </Link>
            ))}
            {doctors.length === 0 && (
              <p className="py-6 text-sm text-ink-60">No doctors found within 15 km. Try browsing all doctors below.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
