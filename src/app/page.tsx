import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { prisma } from "@/server/lib/prisma";

const DEFAULT_CLINIC_ID = "clinic_01";

async function getClinics() {
  return prisma.clinic.findMany({
    where: { isActive: true },
    select: { id: true, name: true, area: true, city: true, qrToken: true },
    orderBy: { name: "asc" },
    take: 4,
  });
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-teal mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function HomePage() {
  const clinics = await getClinics();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Top pill notice */}
      <div className="flex justify-center pt-8 pb-2">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 border border-line text-xs">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal" />
          </span>
          <span className="text-ink tracking-wide">AI-powered clinic reception</span>
          <span className="text-ink-50">·</span>
          <span className="text-ink-50">Live across Mumbai clinics</span>
        </div>
      </div>

      {/* Hero */}
      <section className="px-6 pt-6 pb-20">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center animate-in">
          <h1 className="font-serif text-5xl md:text-6xl text-ink max-w-3xl leading-[1.08] tracking-tight">
            Your clinic&apos;s front desk, available 24/7.
          </h1>
          <p className="text-base text-ink-70 max-w-xl mt-6 leading-relaxed">
            ClinicAI handles patient questions, symptom triage, and appointment booking —
            so your staff can stay focused on the patient right in front of them.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <Link
              href="/find"
              className="inline-flex items-center px-6 py-3 bg-ink text-paper text-xs uppercase tracking-widest hover:bg-ink/90"
            >
              Find a doctor
            </Link>
            <Link
              href={`/chat/${DEFAULT_CLINIC_ID}`}
              className="inline-flex items-center gap-2 px-6 py-3 border border-line-strong text-ink text-xs uppercase tracking-widest hover:border-ink"
            >
              Ask ClinicAI →
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-ink-50 text-xs">
            <span>Multilingual — Hindi &amp; Hinglish supported</span>
            <span className="opacity-40">·</span>
            <span>Live walk-in queue tracking</span>
            <span className="opacity-40">·</span>
            <span>Real doctors, real clinics, no invented data</span>
          </div>

          {/* Product mockup */}
          <div className="w-full max-w-4xl mt-14">
            <div className="border border-line bg-paper text-left">
              <div className="bg-line/30 px-5 py-3.5 flex items-center justify-between border-b border-line">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-teal/60" />
                  <span className="font-mono text-xs text-ink-50 ml-3 hidden sm:inline">clinicai.app</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-paper text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                  <span className="text-ink">ClinicAI Assistant</span>
                  <span className="text-ink-50">· Lilavati Hospital</span>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-5">
                <div className="flex justify-end">
                  <div className="bg-line/40 text-ink px-4 py-2.5 max-w-[80%] text-sm">
                    Mujhe bukhar aur khaansi hai, kaun se doctor se milna chahiye?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-ink text-paper px-4 py-2.5 max-w-[85%] text-sm space-y-3">
                    <p>Aapke symptoms ke hisaab se, main General Physician se milne ki salaah dunga.</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-paper text-ink p-3 text-xs">
                        <p className="text-teal font-medium">Available today</p>
                        <p className="font-mono mt-1">Dr. Aarti Joshi · 5:00 PM</p>
                        <p className="text-ink-50 mt-0.5">Hiranandani Hospital, Powai</p>
                      </div>
                      <div className="bg-paper text-ink p-3 text-xs">
                        <p className="text-ink-50">Tomorrow</p>
                        <p className="font-mono mt-1">Dr. Deepika Nair · 10:00 AM</p>
                        <p className="text-ink-50 mt-0.5">Lilavati Hospital, Bandra</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-line/30 text-xs text-ink-70">
                  <CheckIcon />
                  <span>Booked instantly — no phone call, no waiting on hold.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 py-16 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-ink-50">Built for real clinics</span>
              <h2 className="font-serif text-3xl text-ink mt-2">A calmer front desk.</h2>
            </div>
            <p className="text-sm text-ink-70 max-w-sm">
              Every answer comes from your real doctors, schedules, and FAQs — never invented.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
            {[
              { title: "Always available", body: "Patients can ask questions and book appointments any time — no hold music, no missed calls." },
              { title: "Faster booking", body: "From symptom to confirmed appointment in under a minute, not a phone queue." },
              { title: "Speaks their language", body: "Understands Hindi, Hinglish, and English in the same conversation, naturally." },
              { title: "Live queue visibility", body: "Walk-in patients see their real position and estimated wait time, updating live." },
            ].map((f) => (
              <div key={f.title} className="bg-paper p-6 hover:bg-line/10 transition-colors">
                <h3 className="text-sm font-medium text-ink">{f.title}</h3>
                <p className="text-sm text-ink-70 mt-2 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-xl mb-14">
            <span className="text-xs uppercase tracking-widest text-ink-50">How it works</span>
            <h2 className="font-serif text-3xl text-ink mt-2">
              From a question to a confirmed visit.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
            {[
              { n: "01", title: "Patient asks", body: "Describes symptoms or asks about the clinic, in plain language.", example: "\u201cI have a bad cough and fever.\u201d" },
              { n: "02", title: "ClinicAI understands", body: "Matches the message to a real specialization, or a real FAQ answer, from your clinic's own data.", example: "Routed to: General Physician" },
              { n: "03", title: "Booking confirmed", body: "Patient picks a real open slot and books directly — no double-booking, ever.", example: "Confirmed for 5:00 PM today" },
            ].map((s) => (
              <div key={s.n} className="bg-paper p-8 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xl text-ink-50">{s.n}</span>
                  <h3 className="text-lg text-ink mt-4">{s.title}</h3>
                  <p className="text-sm text-ink-70 mt-3 leading-relaxed">{s.body}</p>
                </div>
                <div className="mt-8 pt-4 bg-line/20 p-3 text-xs text-ink-70 font-mono">{s.example}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module showcase */}
      <section className="px-6 py-20 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-xl mb-12">
            <span className="text-xs uppercase tracking-widest text-ink-50">System modules</span>
            <h2 className="font-serif text-3xl text-ink mt-2">Three parts, one clinic.</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-line border border-line">
            <div className="bg-paper p-6">
              <span className="text-xs uppercase tracking-widest text-ink-50">Module 01</span>
              <h3 className="text-lg text-ink mt-3">AI Receptionist</h3>
              <p className="text-sm text-ink-70 mt-2 leading-relaxed">
                Understands symptoms and questions, routes to the right specialist or answer — grounded in real clinic data.
              </p>
              <div className="mt-6 border border-line p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2"><CheckIcon /><span>Emergency detection</span></div>
                <div className="flex items-center gap-2"><CheckIcon /><span>Never invents medical advice</span></div>
                <div className="flex items-center gap-2"><CheckIcon /><span>Hindi &amp; Hinglish support</span></div>
              </div>
            </div>
            <div className="bg-paper p-6">
              <span className="text-xs uppercase tracking-widest text-ink-50">Module 02</span>
              <h3 className="text-lg text-ink mt-3">Appointment Booking</h3>
              <p className="text-sm text-ink-70 mt-2 leading-relaxed">
                Real-time availability, computed from each doctor's schedule and leave — race-safe under concurrent bookings.
              </p>
              <div className="mt-6 border border-line p-4 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span className="text-ink">10:00 – 10:15</span><span className="text-ink-50">Booked</span></div>
                <div className="flex justify-between bg-teal/10 -mx-1 px-1"><span className="text-teal">10:15 – 10:30</span><span className="text-teal">Open</span></div>
                <div className="flex justify-between"><span className="text-ink">10:30 – 10:45</span><span className="text-ink-50">Booked</span></div>
              </div>
            </div>
            <div className="bg-paper p-6">
              <span className="text-xs uppercase tracking-widest text-ink-50">Module 03</span>
              <h3 className="text-lg text-ink mt-3">Clinic Dashboard</h3>
              <p className="text-sm text-ink-70 mt-2 leading-relaxed">
                Live queue management, doctor performance, and no-show tracking — built from real appointment data.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
                <div className="border border-line p-3">
                  <p className="text-ink-50">Completion rate</p>
                  <p className="font-mono text-ink text-lg mt-1">Live</p>
                </div>
                <div className="border border-line p-3">
                  <p className="text-ink-50">Live queue</p>
                  <p className="font-mono text-teal text-lg mt-1">Real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <div className="bg-ink text-paper p-10 md:p-16 relative overflow-hidden">
            <div className="max-w-2xl space-y-6 relative z-10">
              <span className="text-xs uppercase tracking-widest text-paper/60">Get started</span>
              <h2 className="font-serif text-4xl leading-tight">
                Let your clinic focus on patients. We&apos;ll handle the front desk.
              </h2>
              <p className="text-paper/70 max-w-lg">
                Try ClinicAI now — describe a symptom, browse real doctors, or scan a clinic&apos;s
                QR code to see the live walk-in queue in action.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/find" className="px-6 py-3.5 bg-paper text-ink text-xs uppercase tracking-widest hover:bg-paper/90">
                  Find a doctor
                </Link>
                <Link href="/sign-in" className="px-6 py-3.5 border border-paper/30 text-paper text-xs uppercase tracking-widest hover:border-paper/60">
                  Clinic staff sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-16 px-6 mt-auto">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10">
            <div>
              <span className="font-serif text-lg text-ink">ClinicAI</span>
              <p className="text-sm text-ink-70 mt-3 max-w-xs leading-relaxed">
                An AI receptionist for clinics — symptom triage, booking, and live walk-in queues, grounded in real data.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-50 mb-3">Partner clinics</p>
              <ul className="space-y-2 text-sm">
                {clinics.map((c) => (
                  <li key={c.id}>
                    <Link href={`/checkin/${c.qrToken}`} className="text-ink-70 hover:text-teal">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-50 mb-3">Product</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/find" className="text-ink-70 hover:text-teal">Find a doctor</Link></li>
                <li><Link href={`/chat/${DEFAULT_CLINIC_ID}`} className="text-ink-70 hover:text-teal">Ask ClinicAI</Link></li>
                <li><Link href="/sign-in" className="text-ink-70 hover:text-teal">Clinic staff sign in</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-ink-50 text-xs">
            <p>© 2026 ClinicAI. A coursework project built on real clinic data for Mumbai.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
