import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/server/lib/prisma";

const DEFAULT_CLINIC_ID = "clinic_01"; // Lilavati — used for the homepage's main chat CTA

async function getClinics() {
  return prisma.clinic.findMany({
    where: { isActive: true },
    select: { id: true, name: true, area: true, city: true, qrToken: true },
    orderBy: { name: "asc" },
    take: 6,
  });
}

export default async function HomePage() {
  const clinics = await getClinics();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <p className="text-sm text-ink-60">AI-powered clinic receptionist</p>
        <h1 className="font-serif text-4xl text-ink mt-2 max-w-xl">
          Book appointments and skip the wait, across Mumbai's leading clinics.
        </h1>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/chat/${DEFAULT_CLINIC_ID}`}
            className="bg-teal text-paper text-sm px-5 py-3 hover:bg-teal/90"
          >
            Ask ClinicAI
          </Link>
          <Link
            href="/find"
            className="bg-ink text-paper text-sm px-5 py-3 hover:bg-ink/90"
          >
            Find a doctor
          </Link>
          <Link
            href="/sign-in"
            className="border border-line text-ink text-sm px-5 py-3 hover:border-ink"
          >
            Clinic staff sign in
          </Link>
        </div>

        <div className="mt-16 border-t border-line pt-10">
          <h2 className="font-serif text-lg text-ink mb-6">Partner clinics</h2>
          <div className="grid grid-cols-2 gap-px bg-line border border-line">
            {clinics.map((clinic) => (
              <div key={clinic.id} className="bg-paper p-5">
                <p className="text-ink text-sm font-medium">{clinic.name}</p>
                <p className="text-xs text-ink-60 mt-0.5">{clinic.area}, {clinic.city}</p>
                <div className="mt-3 flex gap-4">
                  <Link href={`/chat/${clinic.id}`} className="text-xs text-teal underline">
                    Ask a question
                  </Link>
                  <Link href={`/checkin/${clinic.qrToken}`} className="text-xs text-teal underline">
                    Walk-in check-in
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
