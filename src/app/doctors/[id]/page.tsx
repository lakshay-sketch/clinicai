import { prisma } from "@/server/lib/prisma";
import BookingWidget from "./BookingWidget";
import SiteHeader from "@/components/SiteHeader";

async function getDoctor(id: string) {
  return prisma.doctor.findUnique({
    where: { id },
    include: { specialization: true, clinic: true },
  });
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

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="max-w-2xl mx-auto px-6 py-14 w-full animate-in">
        <p className="text-sm text-teal font-medium">{doctor.specialization.name}</p>
        <h1 className="font-serif text-3xl text-ink mt-2">{doctor.name}</h1>
        <p className="text-sm text-ink-70 mt-2">{doctor.qualification} · {doctor.experienceYears} years experience</p>

        <div className="mt-6 border border-line p-5 text-sm">
          <p className="text-ink font-medium">{doctor.clinic.name}</p>
          <p className="text-ink-70 mt-1">{doctor.clinic.address}, {doctor.clinic.area}, {doctor.clinic.city}</p>
        </div>

        {doctor.bio && <p className="mt-6 text-sm text-ink-70 leading-relaxed">{doctor.bio}</p>}

        <div className="mt-6 flex items-baseline gap-5">
          <span className="font-mono text-xl text-ink">₹{doctor.consultationFee}</span>
          {doctor.reviewCount > 0 && (
            <span className="text-sm text-teal font-mono">
              {doctor.avgRating.toFixed(1)} · {doctor.reviewCount} reviews
            </span>
          )}
        </div>

        <div className="mt-12 border-t border-line pt-10">
          <h2 className="font-serif text-xl text-ink mb-6">Book an appointment</h2>
          <BookingWidget doctorId={doctor.id} />
        </div>
      </div>
    </div>
  );
}
