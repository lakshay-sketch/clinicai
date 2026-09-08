import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/server/lib/prisma";
import ChatWidget from "@/app/chat/[clinicId]/ChatWidget";

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
      {/* Hero — full-bleed gradient, no photography, deliberately */}
      <div className="relative min-h-[92vh] flex flex-col bg-ink overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 20%, #1f6f6b55, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, #1f6f6b33, transparent 60%), linear-gradient(180deg, #0d1a2e 0%, #12233d 100%)",
          }}
        />
        <div className="relative z-10">
          <SiteHeader transparent />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end max-w-5xl mx-auto px-6 pb-24 w-full">
          <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
            AI-powered clinic receptionist
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-paper leading-[1.05] max-w-2xl">
            Book appointments and skip the wait.
          </h1>
          <p className="text-base text-paper/60 mt-6 max-w-md leading-relaxed">
            Describe your symptoms and ClinicAI will point you to the right doctor
            across Mumbai's leading clinics — or browse and book directly.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/find"
              className="bg-paper text-ink text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-paper/90"
            >
              Browse all doctors
            </Link>
            <Link
              href={`/chat/${DEFAULT_CLINIC_ID}`}
              className="border border-paper/30 text-paper text-xs uppercase tracking-widest px-6 py-3.5 hover:border-paper/60"
            >
              Ask ClinicAI →
            </Link>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-8 w-full flex items-center gap-2 text-paper/40 text-xs uppercase tracking-widest">
          <span>↓</span> Scroll to explore
        </div>
      </div>

      {/* Chat + clinics section */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full animate-in">
        <p className="text-xs uppercase tracking-widest text-ink-50 mb-4">Talk to ClinicAI</p>
        <div className="max-w-lg">
          <ChatWidget clinicId={DEFAULT_CLINIC_ID} />
        </div>

        <div className="mt-24 border-t border-line pt-12">
          <h2 className="font-serif text-2xl text-ink mb-8">Partner clinics</h2>
          <div className="grid grid-cols-2 gap-px bg-line border border-line">
            {clinics.map((clinic) => (
              <div key={clinic.id} className="bg-paper p-7 hover:bg-line/10 transition-colors">
                <p className="text-ink text-sm font-medium">{clinic.name}</p>
                <p className="text-xs text-ink-50 mt-1">{clinic.area}, {clinic.city}</p>
                <Link
                  href={`/checkin/${clinic.qrToken}`}
                  className="text-xs uppercase tracking-widest text-teal hover:opacity-80 mt-5 inline-block"
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
