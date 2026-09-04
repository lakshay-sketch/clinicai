import Link from "next/link";

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
  const url = new URL("http://localhost:3000/api/doctors/search");
  url.searchParams.set("pageSize", "20");
  if (specializationId) url.searchParams.set("specializationId", specializationId);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = await res.json();
  return json.success ? (json.data as Doctor[]) : [];
}

export default async function FindDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ specializationId?: string }>;
}) {
  const { specializationId } = await searchParams;
  const doctors = await getDoctors(specializationId);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-serif text-2xl text-ink">Find a doctor</h1>
      <p className="text-sm text-ink-60 mt-1">
        {specializationId
          ? `Showing ${doctors[0]?.specialization.name ?? "matching"} doctors.`
          : "Browse doctors across our partner clinics in Mumbai."}
      </p>
      {specializationId && (
        <Link href="/find" className="text-sm text-teal underline mt-1 inline-block">
          Clear filter — show all doctors
        </Link>
      )}

      <div className="mt-8 divide-y divide-line border-t border-line">
        {doctors.length === 0 && (
          <p className="py-6 text-sm text-ink-60">No doctors found for this filter.</p>
        )}
        {doctors.map((doc) => (
          <Link
            key={doc.id}
            href={`/doctors/${doc.id}`}
            className="block py-5 hover:bg-line/20 -mx-2 px-2 transition-colors"
          >
            <div className="flex items-baseline justify-between">
              <p className="text-ink font-medium">{doc.name}</p>
              <p className="font-mono text-sm text-ink">₹{doc.consultationFee}</p>
            </div>
            <p className="text-sm text-ink-60 mt-0.5">
              {doc.specialization.name} · {doc.experienceYears} yrs experience
            </p>
            <p className="text-sm text-ink-60 mt-0.5">
              {doc.clinic.name}, {doc.clinic.area}
            </p>
            {doc.reviewCount > 0 && (
              <p className="text-sm text-teal mt-1 font-mono">
                {doc.avgRating.toFixed(1)} · {doc.reviewCount} review{doc.reviewCount !== 1 ? "s" : ""}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
