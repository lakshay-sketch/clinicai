import { prisma } from "@/server/lib/prisma";
import BookingWidget from "./BookingWidget";

async function getDoctor(id: string) {
  return prisma.doctor.findUnique({
    where: { id },
    include: { specialization: true, clinic: true },
  });
}

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await getDoctor(id);

  if (!doctor) return <p className="max-w-2xl mx-auto px-6 py-10 text-sm text-ink-60">Doctor not found.</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-sm text-ink-60">{doctor.specialization.name}</p>
      <h1 className="font-serif text-2xl text-ink mt-1">{doctor.name}</h1>
      <p className="text-sm text-ink-60 mt-1">{doctor.qualification} · {doctor.experienceYears} years experience</p>

      <div className="mt-4 border border-line p-4 text-sm">
        <p className="text-ink">{doctor.clinic.name}</p>
        <p className="text-ink-60">{doctor.clinic.address}, {doctor.clinic.area}, {doctor.clinic.city}</p>
      </div>

      <p className="mt-4 text-sm text-ink-60">{doctor.bio}</p>

      <div className="mt-4 flex items-baseline gap-4">
        <span className="font-mono text-lg text-ink">₹{doctor.consultationFee}</span>
        {doctor.reviewCount > 0 && (
          <span className="text-sm text-teal font-mono">
            {doctor.avgRating.toFixed(1)} · {doctor.reviewCount} reviews
          </span>
        )}
      </div>

      <div className="mt-8 border-t border-line pt-8">
        <h2 className="font-serif text-lg text-ink mb-4">Book an appointment</h2>
        <BookingWidget doctorId={doctor.id} />
      </div>
    </div>
  );
}
