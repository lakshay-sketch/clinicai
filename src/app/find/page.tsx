import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/server/lib/prisma";
import DoctorDirectory, { type DirectoryDoctor } from "./DoctorDirectory";

async function getDoctors(): Promise<DirectoryDoctor[]> {
  const rows = await prisma.doctor.findMany({
    where: { isActive: true },
    include: { specialization: true, clinic: true },
    orderBy: { avgRating: "desc" },
    take: 60,
  });

  return rows.map((d) => ({
    id: d.id,
    name: d.name,
    qualification: d.qualification,
    experienceYears: d.experienceYears,
    consultationFee: d.consultationFee,
    avgRating: d.avgRating,
    reviewCount: d.reviewCount,
    specializationId: d.specializationId,
    specializationName: d.specialization.name,
    clinicName: d.clinic.name,
    clinicArea: d.clinic.area,
  }));
}

export default async function FindDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ specializationId?: string }>;
}) {
  const { specializationId } = await searchParams;
  const doctors = await getDoctors();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="max-w-4xl mx-auto w-full px-6 py-14 sm:py-20 animate-in">
        <header className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-ink-50 font-mono">
            <span className="w-6 h-px bg-line-strong" />
            Physician directory · Mumbai
            <span className="w-6 h-px bg-line-strong" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink tracking-tight leading-[1.1] mt-5">
            Find a doctor
          </h1>
          <p className="text-base text-ink-70 max-w-xl mt-4 leading-relaxed">
            Browse doctors across our partner clinics in Mumbai.
          </p>
        </header>

        <DoctorDirectory doctors={doctors} initialSpecializationId={specializationId} />
      </main>
    </div>
  );
}
