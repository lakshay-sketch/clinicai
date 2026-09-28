"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Crosshair,
  MapPin,
  Star,
  ArrowRight,
  SearchX,
  Loader2,
  RotateCcw,
} from "lucide-react";

export type DirectoryDoctor = {
  id: string;
  name: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  avgRating: number;
  reviewCount: number;
  specializationId: string;
  specializationName: string;
  clinicName: string;
  clinicArea: string;
};

type GeoStatus = "idle" | "locating" | "loading" | "done" | "error";

const TONES = [
  { bg: "bg-teal-soft", text: "text-teal" },
  { bg: "bg-amber/10", text: "text-amber" },
  { bg: "bg-ink/5", text: "text-ink" },
];

function toneFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return TONES[hash % TONES.length];
}

function initialsOf(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const softShadow = "shadow-[0_4px_24px_rgba(18,35,61,0.035)]";
const liftShadow = "hover:shadow-[0_8px_30px_rgba(18,35,61,0.07)]";

export default function DoctorDirectory({
  doctors,
  initialSpecializationId,
}: {
  doctors: DirectoryDoctor[];
  initialSpecializationId?: string;
}) {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string>(() =>
    initialSpecializationId && doctors.some((d) => d.specializationId === initialSpecializationId)
      ? initialSpecializationId
      : "all"
  );
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [distances, setDistances] = useState<Record<string, number>>({});

  const specialties = useMemo(() => {
    const map = new Map<string, string>();
    doctors.forEach((d) => map.set(d.specializationId, d.specializationName));
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [doctors]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = doctors.filter((d) => {
      const matchesSpecialty = specialty === "all" || d.specializationId === specialty;
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specializationName.toLowerCase().includes(q) ||
        d.clinicName.toLowerCase().includes(q) ||
        d.clinicArea.toLowerCase().includes(q);
      return matchesSpecialty && matchesQuery;
    });
    if (geoStatus === "done") {
      return [...list].sort((a, b) => {
        const da = distances[a.id] as number | undefined;
        const db = distances[b.id] as number | undefined;
        if (da === undefined && db === undefined) return 0;
        if (da === undefined) return 1;
        if (db === undefined) return -1;
        return da - db;
      });
    }
    return list;
  }, [doctors, query, specialty, geoStatus, distances]);

  function locate() {
    setGeoStatus("locating");
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("Your browser doesn't support location services.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setGeoStatus("loading");
        try {
          const url = new URL("/api/doctors/nearby", window.location.origin);
          url.searchParams.set("lat", String(position.coords.latitude));
          url.searchParams.set("lng", String(position.coords.longitude));
          url.searchParams.set("radiusKm", "15");
          const res = await fetch(url.toString());
          const json = await res.json();
          if (json.success) {
            const next: Record<string, number> = {};
            for (const item of json.data as { id: string; distanceKm: number }[]) {
              next[item.id] = item.distanceKm;
            }
            setDistances(next);
            setGeoStatus("done");
          } else {
            setGeoStatus("error");
            setGeoError(json.error?.message ?? "Could not load nearby doctors.");
          }
        } catch {
          setGeoStatus("error");
          setGeoError("Could not load nearby doctors. Please try again.");
        }
      },
      () => {
        setGeoStatus("error");
        setGeoError("Location access was denied. Enable it in your browser settings to sort by distance.");
      }
    );
  }

  function clearLocation() {
    setGeoStatus("idle");
    setGeoError(null);
    setDistances({});
  }

  function resetFilters() {
    setQuery("");
    setSpecialty("all");
  }

  const busy = geoStatus === "locating" || geoStatus === "loading";
  const nearbyCount = Object.keys(distances).length;

  return (
    <div>
      {/* Location action */}
      <div className="flex flex-col items-center">
        {geoStatus === "done" ? (
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-paper border border-line ${softShadow}`}>
            <span className="w-9 h-9 rounded-lg bg-teal-soft flex items-center justify-center text-teal">
              <Crosshair size={17} strokeWidth={1.5} />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium text-ink flex items-center gap-2">
                Sorted by distance
                <span className="w-1.5 h-1.5 rounded-full bg-teal ring-2 ring-teal/20" />
              </span>
              <span className="text-[11px] font-mono text-ink-50">
                {nearbyCount} doctor{nearbyCount !== 1 ? "s" : ""} within 15 km
              </span>
            </span>
            <button
              onClick={clearLocation}
              className="ml-2 text-xs text-ink-50 hover:text-ink underline underline-offset-2"
            >
              Clear
            </button>
          </div>
        ) : (
          <button
            onClick={locate}
            disabled={busy}
            className={`group inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-paper border border-line ${softShadow} hover:shadow-[0_6px_28px_rgba(18,35,61,0.07)] transition-all duration-300 text-left active:scale-[0.99] disabled:opacity-70`}
          >
            <span className="w-9 h-9 rounded-lg bg-teal-soft flex items-center justify-center text-teal">
              {busy ? (
                <Loader2 size={17} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <Crosshair size={17} strokeWidth={1.5} />
              )}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium text-ink">
                {geoStatus === "locating"
                  ? "Getting your location…"
                  : geoStatus === "loading"
                  ? "Finding doctors near you…"
                  : "Locate nearest doctors"}
              </span>
              <span className="text-[11px] font-mono text-ink-50">
                Uses your browser location · sorted by distance
              </span>
            </span>
          </button>
        )}
        {geoStatus === "error" && geoError && <p className="text-sm text-red mt-3">{geoError}</p>}
      </div>

      {/* Search and filters */}
      <section className={`mt-10 bg-paper border border-line ${softShadow} rounded-xl p-4 sm:p-5 space-y-4`}>
        <div className="relative">
          <Search size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor, specialization or clinic…"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-line/20 text-sm text-ink placeholder:text-ink-50 focus:bg-paper focus:outline-none focus:ring-2 focus:ring-teal-soft transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-50 hover:text-ink"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSpecialty("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                specialty === "all" ? "bg-ink text-paper" : "bg-line/30 text-ink-70 hover:text-ink hover:bg-line/50"
              }`}
            >
              All
            </button>
            {specialties.map((s) => (
              <button
                key={s.id}
                onClick={() => setSpecialty(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  specialty === s.id ? "bg-ink text-paper" : "bg-line/30 text-ink-70 hover:text-ink hover:bg-line/50"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <p className="text-[11px] font-mono text-ink-50 shrink-0">
            Showing {visible.length} of {doctors.length} doctor{doctors.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Doctor list */}
      <div className="mt-6 flex flex-col gap-4">
        {visible.map((d) => {
          const tone = toneFor(d.specializationName);
          const dist = distances[d.id] as number | undefined;
          return (
            <Link
              key={d.id}
              href={`/doctors/${d.id}`}
              className={`group block bg-paper rounded-xl border border-line ${softShadow} ${liftShadow} hover:-translate-y-0.5 transition-all duration-200 p-5 sm:p-6`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <span
                    className={`w-14 h-14 rounded-full ${tone.bg} ${tone.text} ring-1 ring-line flex items-center justify-center font-serif text-lg font-semibold shrink-0 select-none`}
                  >
                    {initialsOf(d.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl text-ink tracking-tight">{d.name}</h2>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded ${tone.bg} ${tone.text} text-[10px] uppercase tracking-wider font-medium`}
                      >
                        {d.specializationName}
                      </span>
                    </div>
                    <p className="text-sm text-ink-70 mt-1">
                      {d.qualification ? `${d.qualification} · ` : ""}
                      <span className="font-mono text-ink">{d.experienceYears}</span> yrs experience
                    </p>
                    <p className="text-sm text-ink-50 mt-0.5">
                      {d.clinicName}, {d.clinicArea}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-mono">
                      {d.reviewCount > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Star size={13} className="text-amber fill-amber" />
                          <span className="text-ink font-medium">{d.avgRating.toFixed(1)}</span>
                          <span className="text-ink-50">
                            · {d.reviewCount} review{d.reviewCount !== 1 ? "s" : ""}
                          </span>
                        </span>
                      ) : (
                        <span className="text-ink-50">No reviews yet</span>
                      )}
                      {dist !== undefined && (
                        <span className="inline-flex items-center gap-1 text-ink-70">
                          <MapPin size={13} strokeWidth={1.5} className="text-ink-50" />
                          <span className="text-ink">{dist.toFixed(1)} km</span> away
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <div className="sm:text-right">
                    <p className="font-mono text-xl text-ink font-semibold tracking-tight">
                      ₹{d.consultationFee.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-ink-50 font-medium">Consultation</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm text-teal font-medium sm:mt-2">
                    View &amp; book
                    <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {visible.length === 0 && (
          <div className={`text-center py-16 px-6 bg-paper rounded-xl border border-line ${softShadow}`}>
            <span className="w-12 h-12 mx-auto rounded-full bg-line/30 flex items-center justify-center text-ink-50 mb-3">
              <SearchX size={22} strokeWidth={1.5} />
            </span>
            <h3 className="font-serif text-lg text-ink">
              {doctors.length === 0 ? "No doctors available yet" : "No doctors match your search"}
            </h3>
            {doctors.length > 0 && (
              <>
                <p className="text-sm text-ink-70 max-w-sm mx-auto mt-2">
                  Try a different name, or clear the specialization filter.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-line/30 text-teal text-sm font-medium hover:bg-line/50 transition-colors"
                >
                  <RotateCcw size={14} strokeWidth={1.5} />
                  Reset filters
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
