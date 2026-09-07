import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/server/lib/prisma";
import NearbySearch from "./NearbySearch";

type Doctor = {
  id: string;
  name: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  avgRating: number;
  reviewCount: number;
  specialization: { name: string };
  clinic: { name: string; area: string; city: string };
};

async function getDoctors(specializationId?: string) {
  return prisma.doctor.findMany({
    where: {
      isActive: true,
      ...(specializationId && { specializationId }),
    },
    include: { specialization: true, clinic: true },
    orderBy: { avgRating: "desc" },
    take: 20,
  }) as unknown as Promise<Doctor[]>;
}

export default async function FindDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ specializationId?: string }>;
}) {
  const { specializationId } = await searchParams;
  const doctors = await getDoctors(specializationId);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-14 w-full animate-in">
        <h1 className="font-serif text-3xl text-ink">Find a doctor</h1>
        <p className="text-sm text-ink-70 mt-2">
          {specializationId
            ? `Showing ${doctors[0]?.specialization.name ?? "matching"} doctors.`
            : "Browse doctors across our partner clinics in Mumbai."}
        </p>
        {specializationId && (
          <Link href="/find" className="text-sm text-teal hover:underline underline-offset-2 mt-1 inline-block">
            Clear filter — show all doctors
          </Link>
        )}

        <div className="mt-8">
          <NearbySearch specializationId={specializationId} />
        </div>

        <h2 className="text-xs font-medium text-ink-50 uppercase tracking-wide mt-10 mb-1">All doctors</h2>
        <div className="divide-y divide-line border-t border-line">
          {doctors.length === 0 && (
            <p className="py-8 text-sm text-ink-70">No doctors found for this filter.</p>
          )}
          {doctors.map((doc) => (
            <Link
              key={doc.id}
              href={`/doctors/${doc.id}`}
              className="block py-6 hover:bg-line/10 -mx-3 px-3 transition-colors"
            >
              <div className="flex items-baseline justify-between">
                <p className="text-ink font-medium">{doc.name}</p>
                <p className="font-mono text-sm text-ink">₹{doc.consultationFee}</p>
              </div>
              <p className="text-sm text-ink-70 mt-1">
                {doc.specialization.name} · {doc.experienceYears} yrs experience
              </p>
              <p className="text-sm text-ink-50 mt-0.5">
                {doc.clinic.name}, {doc.clinic.area}
              </p>
              {doc.reviewCount > 0 && (
                <p className="text-sm text-teal mt-2 font-mono">
                  {doc.avgRating.toFixed(1)} · {doc.reviewCount} review{doc.reviewCount !== 1 ? "s" : ""}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
