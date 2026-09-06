import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/server/lib/prisma";
import ChatWidget from "@/app/chat/[clinicId]/ChatWidget";
import { LinkButton } from "@/components/ui/Button";

const DEFAULT_CLINIC_ID = "clinic_01";

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

      <main className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full animate-in">
        <div className="max-w-lg">
          <p className="text-sm text-teal font-medium tracking-wide">AI-powered clinic receptionist</p>
          <h1 className="font-serif text-4xl text-ink mt-3 leading-tight">
            Book appointments and skip the wait.
          </h1>
          <p className="text-base text-ink-70 mt-4 leading-relaxed">
            Describe your symptoms below and ClinicAI will point you to the right
            doctor across Mumbai's leading clinics — or browse and book directly.
          </p>
        </div>

        <div className="mt-10 max-w-lg">
          <ChatWidget clinicId={DEFAULT_CLINIC_ID} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/find" variant="secondary">
            Browse all doctors
          </LinkButton>
          <LinkButton href="/sign-in" variant="ghost">
            Clinic staff sign in →
          </LinkButton>
        </div>

        <div className="mt-24 border-t border-line pt-12">
          <h2 className="font-serif text-xl text-ink mb-8">Partner clinics</h2>
          <div className="grid grid-cols-2 gap-px bg-line border border-line">
            {clinics.map((clinic) => (
              <div key={clinic.id} className="bg-paper p-6 hover:bg-line/10 transition-colors">
                <p className="text-ink text-sm font-medium">{clinic.name}</p>
                <p className="text-xs text-ink-50 mt-1">{clinic.area}, {clinic.city}</p>
                <Link
                  href={`/checkin/${clinic.qrToken}`}
                  className="text-xs text-teal hover:underline underline-offset-2 mt-4 inline-block"
                >
                  Walk-in check-in →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
