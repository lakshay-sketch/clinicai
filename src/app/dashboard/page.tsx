import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/server/lib/prisma";
import { Stethoscope, Hourglass, CheckCircle2, MapPin, ArrowRight } from "lucide-react";
import AppointmentsTable, { type OverviewAppointment } from "./AppointmentsTable";

async function getOverviewData() {
  const { userId } = await auth();
  if (!userId) return null;

  const staff = await prisma.staffUser.findUnique({ where: { clerkUserId: userId } });
  if (!staff) return null;

  const clinic = await prisma.clinic.findUnique({ where: { id: staff.clinicId } });

  const [totalDoctorCount, activeDoctors] = await Promise.all([
    prisma.doctor.count({ where: { clinicId: staff.clinicId } }),
    prisma.doctor.findMany({
      where: { clinicId: staff.clinicId, isActive: true },
      select: { id: true, name: true, specialization: { select: { name: true } } },
      orderBy: { name: "asc" },
      take: 6,
    }),
  ]);

  const today = new Date();
  const queueDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const allDoctors = await prisma.doctor.findMany({
    where: { clinicId: staff.clinicId },
    select: { id: true },
  });
  const doctorIds = allDoctors.map((d) => d.id);

  const waitingEntries = await prisma.queueEntry.findMany({
    where: { doctorId: { in: doctorIds }, queueDate, status: { in: ["waiting", "called"] } },
    select: { estimatedWaitMinutes: true },
  });

  const queueWaiting = waitingEntries.length;
  const avgWaitMinutes =
    queueWaiting > 0
      ? Math.round(waitingEntries.reduce((s, e) => s + (e.estimatedWaitMinutes ?? 0), 0) / queueWaiting)
      : null;

  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: { in: doctorIds },
      type: "SCHEDULED",
      status: "confirmed",
      date: { gte: queueDate },
    },
    include: { patient: true, doctor: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 20,
  });

  return {
    clinic,
    totalDoctorCount,
    activeDoctors,
    queueWaiting,
    avgWaitMinutes,
    staffName: staff.name,
    upcomingAppointments,
  };
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardOverview() {
  const data = await getOverviewData();

  if (!data || !data.clinic) {
    return <p className="text-sm text-ink-70">Unable to load clinic data.</p>;
  }

  const appointments: OverviewAppointment[] = data.upcomingAppointments.map((a) => ({
    id: a.id,
    date: a.date.toISOString().split("T")[0],
    startTime: a.startTime,
    patientName: a.patient.name,
    doctorName: a.doctor.name,
    type: a.type as "SCHEDULED" | "WALK_IN",
    notes: a.notes ?? null,
  }));

  return (
    <div className="space-y-8">
      {/* Header band */}
      <section className="bg-paper rounded-xl border border-line shadow-[0_1px_3px_rgba(18,35,61,0.05),0_8px_24px_-16px_rgba(18,35,61,0.12)] p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-ink tracking-tight">{data.clinic.name}</h1>
            <div className="flex items-center gap-1.5 text-ink-70 text-sm mt-2">
              <MapPin size={15} strokeWidth={1.75} className="text-teal" />
              <span>
                {data.clinic.area}, {data.clinic.city}
              </span>
            </div>
          </div>
          <div className="text-left lg:text-right">
            <p className="font-serif text-lg text-ink">
              {greeting()}, {data.staffName.split(" ")[0]}
            </p>
            <p className="text-xs text-ink-50 mt-0.5">Here&apos;s what&apos;s happening today.</p>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active doctors */}
        <div className="bg-paper rounded-xl border border-line shadow-[0_1px_3px_rgba(18,35,61,0.05),0_8px_24px_-16px_rgba(18,35,61,0.12)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-teal-soft flex items-center justify-center text-teal">
                  <Stethoscope size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs text-ink-50 uppercase tracking-wide">Active doctors</p>
                </div>
              </div>
              <Link
                href="/dashboard/doctors"
                className="inline-flex items-center gap-1 text-xs text-teal hover:underline underline-offset-2"
              >
                Roster <ArrowRight size={12} />
              </Link>
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-mono text-[40px] leading-none text-ink font-semibold">
                {data.activeDoctors.length}
              </span>
              <span className="text-xs text-ink-50">of {data.totalDoctorCount} on roster</span>
            </div>
          </div>

          {data.activeDoctors.length > 0 && (
            <div className="mt-6 pt-4 border-t border-line">
              <p className="text-[11px] text-ink-50 uppercase tracking-wide mb-2">On roster</p>
              <div className="flex flex-wrap gap-1.5">
                {data.activeDoctors.map((d) => (
                  <span
                    key={d.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-line/25 text-xs text-ink"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                    {d.name}
                    {d.specialization ? (
                      <span className="text-ink-50">· {d.specialization.name}</span>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Waiting in queue */}
        <div className="bg-paper rounded-xl border border-line shadow-[0_1px_3px_rgba(18,35,61,0.05),0_8px_24px_-16px_rgba(18,35,61,0.12)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-teal-soft flex items-center justify-center text-teal">
                  <Hourglass size={18} strokeWidth={1.75} />
                </span>
                <p className="text-xs text-ink-50 uppercase tracking-wide">Waiting in queue today</p>
              </div>
              {data.queueWaiting > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-teal">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal" />
                  </span>
                  Live
                </span>
              )}
            </div>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-mono text-[40px] leading-none text-ink font-semibold">
                {data.queueWaiting}
              </span>
              {data.queueWaiting === 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-soft text-teal text-xs font-medium">
                  <CheckCircle2 size={13} /> Queue clear
                </span>
              ) : (
                <span className="text-xs text-ink-50">
                  {data.avgWaitMinutes !== null ? `~${data.avgWaitMinutes} min avg wait` : ""}
                </span>
              )}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-line">
            <Link
              href="/dashboard/queue"
              className="inline-flex items-center gap-1 text-xs text-teal hover:underline underline-offset-2"
            >
              Open live queue board <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* Appointments */}
      <section>
        <AppointmentsTable appointments={appointments} />
      </section>
    </div>
  );
}
