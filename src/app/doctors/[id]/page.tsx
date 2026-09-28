import { prisma } from "@/server/lib/prisma";
import BookingWidget from "./BookingWidget";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, Clock, Languages, ShieldCheck } from "lucide-react";

async function getDoctor(id: string) {
  return prisma.doctor.findUnique({
    where: { id },
    include: { specialization: true, clinic: true },
  });
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

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await getDoctor(id);

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <p className="max-w-2xl mx-auto px-6 py-14 text-sm text-ink-70">Doctor not found.</p>
      </div>
    );
  }

  const mapsQuery =
    doctor.clinic.latitude && doctor.clinic.longitude
      ? String(doctor.clinic.latitude) + "," + String(doctor.clinic.longitude)
      : doctor.clinic.name + ", " + doctor.clinic.address + ", " + doctor.clinic.city;
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mapsQuery);

  const cardShadow = "shadow-[0_1px_3px_rgba(18,35,61,0.05),0_8px_24px_-16px_rgba(18,35,61,0.12)]";

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-0">
      <SiteHeader />
      <div className="max-w-5xl mx-auto w-full px-6 py-10 animate-in">
        <Link href="/find" className="inline-flex items-center gap-1.5 text-xs text-ink-50 hover:text-teal mb-6">
          <ArrowLeft size={13} strokeWidth={1.75} />
          Back to Find a Doctor
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={"lg:col-span-7 bg-paper rounded-xl border border-line " + cardShadow + " p-6 sm:p-8 flex flex-col gap-6"}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <span className="w-20 h-20 rounded-full bg-teal-soft text-teal ring-1 ring-line flex items-center justify-center font-serif text-2xl font-semibold shrink-0">
                {initialsOf(doctor.name)}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex px-2.5 py-0.5 rounded bg-teal-soft text-teal text-[11px] uppercase tracking-wide font-medium">
                    {doctor.specialization.name}
                  </span>
                  {doctor.reviewCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-ink-70">
                      <Star size={12} className="text-amber fill-amber" />
                      {doctor.avgRating.toFixed(1)}
                      <span className="text-ink-50">({doctor.reviewCount})</span>
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-3xl text-ink tracking-tight mt-1">{doctor.name}</h1>
                <p className="text-sm text-ink-70 mt-1.5">
                  {doctor.qualification} · {doctor.experienceYears} years experience
                </p>
              </div>
            </div>

            <div className="h-px bg-line" />

            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-50 flex items-center gap-1.5">
                  <Languages size={12} strokeWidth={1.75} /> Languages
                </p>
                <p className="text-sm text-ink mt-1">{doctor.languages.join(", ")}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-ink-50 flex items-center gap-1.5">
                  <Clock size={12} strokeWidth={1.75} /> Consultation length
                </p>
                <p className="text-sm text-ink mt-1">{doctor.slotDurationMinutes} minutes</p>
              </div>
            </div>

            <div className="h-px bg-line" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <MapPin size={17} strokeWidth={1.5} className="text-teal mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink-50">Location</p>
                  <p className="text-sm font-medium text-ink">{doctor.clinic.name}</p>
                  <p className="text-xs text-ink-70 mt-0.5">
                    {doctor.clinic.address}, {doctor.clinic.area}, {doctor.clinic.city}
                  </p>
                </div>
              </div>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal hover:underline underline-offset-2 shrink-0">
                Open in Maps
              </a>
            </div>

            {doctor.bio && (
              <>
                <div className="h-px bg-line" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-ink-50 mb-2">About</p>
                  <p className="text-sm text-ink-70 leading-relaxed">{doctor.bio}</p>
                </div>
              </>
            )}

            <div className="flex items-start gap-2.5 p-4 rounded-lg bg-line/15">
              <ShieldCheck size={17} strokeWidth={1.5} className="text-teal mt-0.5 shrink-0" />
              <p className="text-xs text-ink-70 leading-relaxed">
                Any symptom notes you shared with ClinicAI will be sent to {doctor.name} ahead of your appointment.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <BookingWidget doctorId={doctor.id} doctorName={doctor.name} consultationFee={doctor.consultationFee} />
          </div>
        </div>
      </div>
    </div>
  );
}
