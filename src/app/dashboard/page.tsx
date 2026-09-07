import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/lib/prisma";

async function getOverviewData() {
  const { userId } = await auth();
  if (!userId) return null;

  const staff = await prisma.staffUser.findUnique({ where: { clerkUserId: userId } });
  if (!staff) return null;

  const clinic = await prisma.clinic.findUnique({ where: { id: staff.clinicId } });
  const doctorCount = await prisma.doctor.count({ where: { clinicId: staff.clinicId, isActive: true } });

  const today = new Date();
  const queueDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const doctorIds = (await prisma.doctor.findMany({
    where: { clinicId: staff.clinicId },
    select: { id: true },
  })).map((d) => d.id);

  const queueWaiting = await prisma.queueEntry.count({
    where: { doctorId: { in: doctorIds }, queueDate, status: { in: ["waiting", "called"] } },
  });

  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: { in: doctorIds },
      type: "SCHEDULED",
      status: "confirmed",
      date: { gte: queueDate },
    },
    include: { patient: true, doctor: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 10,
  });

  return { clinic, doctorCount, queueWaiting, staffName: staff.name, upcomingAppointments };
}

export default async function DashboardOverview() {
  const data = await getOverviewData();

  if (!data || !data.clinic) {
    return <p className="text-sm text-ink-60">Unable to load clinic data.</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{data.clinic.name}</h1>
      <p className="text-sm text-ink-60 mt-1">
        {data.clinic.area}, {data.clinic.city}
      </p>

      <div className="mt-8 grid grid-cols-3 gap-px bg-line border border-line">
        <div className="bg-paper px-6 py-5">
          <p className="text-xs text-ink-60">Active doctors</p>
          <p className="font-mono text-3xl text-ink mt-1">{data.doctorCount}</p>
        </div>
        <div className="bg-paper px-6 py-5">
          <p className="text-xs text-ink-60">Waiting in queue today</p>
          <p className="font-mono text-3xl text-teal mt-1">{data.queueWaiting}</p>
        </div>
        <div className="bg-paper px-6 py-5">
          <p className="text-xs text-ink-60">Signed in as</p>
          <p className="text-lg text-ink mt-1">{data.staffName}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-lg text-ink mb-4">Upcoming appointments</h2>
        <table className="w-full text-sm border-t border-line">
          <thead>
            <tr className="text-left text-ink-60">
              <th className="py-2 pr-4 font-normal">Date</th>
              <th className="py-2 pr-4 font-normal">Time</th>
              <th className="py-2 pr-4 font-normal">Patient</th>
              <th className="py-2 pr-4 font-normal">Doctor</th>
              <th className="py-2 pr-4 font-normal">Notes</th>
            </tr>
          </thead>
          <tbody>
            {data.upcomingAppointments.map((a) => (
              <tr key={a.id} className="border-t border-line">
                <td className="py-3 pr-4 font-mono text-ink">
                  {a.date.toISOString().split("T")[0]}
                </td>
                <td className="py-3 pr-4 font-mono text-ink">{a.startTime}</td>
                <td className="py-3 pr-4 text-ink">{a.patient.name}</td>
                <td className="py-3 pr-4 text-ink-60">{a.doctor.name}</td>
                <td className="py-3 pr-4 text-ink-60 max-w-xs truncate" title={a.notes ?? ""}>
                  {a.notes ?? "—"}
                </td>
              </tr>
            ))}
            {data.upcomingAppointments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-60">
                  No upcoming appointments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
