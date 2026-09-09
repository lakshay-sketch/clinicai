import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/lib/prisma";

async function getAnalytics() {
  const { userId } = await auth();
  if (!userId) return null;

  const staff = await prisma.staffUser.findUnique({ where: { clerkUserId: userId } });
  if (!staff) return null;

  const doctors = await prisma.doctor.findMany({
    where: { clinicId: staff.clinicId, isActive: true },
  });
  const doctorIds = doctors.map((d) => d.id);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
  const thirtyDaysAgoDateOnly = new Date(Date.UTC(thirtyDaysAgo.getUTCFullYear(), thirtyDaysAgo.getUTCMonth(), thirtyDaysAgo.getUTCDate()));

  const recentAppointments = await prisma.appointment.findMany({
    where: { doctorId: { in: doctorIds }, date: { gte: thirtyDaysAgoDateOnly } },
  });

  const total = recentAppointments.length;
  const completed = recentAppointments.filter((a) => a.status === "completed").length;
  const noShow = recentAppointments.filter((a) => a.status === "no_show").length;
  const cancelled = recentAppointments.filter((a) => a.status === "cancelled").length;
  const scheduled = recentAppointments.filter((a) => a.type === "SCHEDULED").length;
  const walkIn = recentAppointments.filter((a) => a.type === "WALK_IN").length;

  const noShowRate = total > 0 ? (noShow / total) * 100 : 0;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  const feeByDoctorId = new Map(doctors.map((d) => [d.id, d.consultationFee]));
  const estimatedRevenue = recentAppointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (feeByDoctorId.get(a.doctorId) ?? 0), 0);

  const reviewCount = doctors.reduce((s, d) => s + d.reviewCount, 0);
  const avgRating =
    reviewCount > 0
      ? doctors.reduce((s, d) => s + d.avgRating * d.reviewCount, 0) / reviewCount
      : 0;

  // Daily trend, last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 13);
  const dayBuckets: { date: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const count = recentAppointments.filter((a) => a.date.toISOString().split("T")[0] === dateStr).length;
    dayBuckets.push({ date: dateStr, count });
  }
  const maxDayCount = Math.max(1, ...dayBuckets.map((d) => d.count));

  // Doctor leaderboard
  const doctorStats = doctors
    .map((d) => {
      const apps = recentAppointments.filter((a) => a.doctorId === d.id);
      return {
        id: d.id,
        name: d.name,
        appointmentCount: apps.length,
        noShowCount: apps.filter((a) => a.status === "no_show").length,
        avgRating: d.avgRating,
        reviewCount: d.reviewCount,
      };
    })
    .sort((a, b) => b.appointmentCount - a.appointmentCount)
    .slice(0, 8);
  const maxDoctorCount = Math.max(1, ...doctorStats.map((d) => d.appointmentCount));

  return {
    total, completed, noShow, cancelled, scheduled, walkIn,
    noShowRate, completionRate, estimatedRevenue, avgRating, reviewCount,
    dayBuckets, maxDayCount, doctorStats, maxDoctorCount,
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  if (!data) return <p className="text-sm text-ink-70">Unable to load analytics.</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Analytics</h1>
      <p className="text-sm text-ink-70 mt-1.5">Last 30 days.</p>

      <div className="mt-8 grid grid-cols-4 gap-px bg-line border border-line">
        <div className="bg-paper px-6 py-6">
          <p className="text-xs text-ink-50 uppercase tracking-wide">Total appointments</p>
          <p className="font-mono text-3xl text-ink mt-2">{data.total}</p>
          <p className="text-xs text-ink-50 mt-1">{data.scheduled} scheduled · {data.walkIn} walk-in</p>
        </div>
        <div className="bg-paper px-6 py-6">
          <p className="text-xs text-ink-50 uppercase tracking-wide">Completion rate</p>
          <p className="font-mono text-3xl text-teal mt-2">{data.completionRate.toFixed(0)}%</p>
          <p className="text-xs text-ink-50 mt-1">{data.completed} completed</p>
        </div>
        <div className="bg-paper px-6 py-6">
          <p className="text-xs text-ink-50 uppercase tracking-wide">No-show rate</p>
          <p className={`font-mono text-3xl mt-2 ${data.noShowRate > 15 ? "text-amber" : "text-ink"}`}>
            {data.noShowRate.toFixed(0)}%
          </p>
          <p className="text-xs text-ink-50 mt-1">{data.noShow} no-shows</p>
        </div>
        <div className="bg-paper px-6 py-6">
          <p className="text-xs text-ink-50 uppercase tracking-wide">Est. revenue</p>
          <p className="font-mono text-3xl text-ink mt-2">₹{data.estimatedRevenue.toLocaleString("en-IN")}</p>
          <p className="text-xs text-ink-50 mt-1">
            {data.reviewCount > 0 ? `${data.avgRating.toFixed(1)} avg rating` : "No reviews yet"}
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-serif text-lg text-ink mb-6">Appointments, last 14 days</h2>
        <div className="flex items-end gap-2 h-32 border-b border-line pb-2">
          {data.dayBuckets.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group">
              <span className="text-xs text-ink-50 mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                {day.count}
              </span>
              <div
                className="w-full bg-teal/70 hover:bg-teal transition-colors"
                style={{ height: `${(day.count / data.maxDayCount) * 100}%`, minHeight: day.count > 0 ? "3px" : "0" }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          {data.dayBuckets.map((day) => (
            <span key={day.date} className="flex-1 text-[10px] text-ink-50 text-center font-mono">
              {day.date.slice(5)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-serif text-lg text-ink mb-6">Doctor performance</h2>
        <table className="w-full text-sm border-t border-line">
          <thead>
            <tr className="text-left text-ink-50">
              <th className="py-2.5 pr-4 font-normal">Doctor</th>
              <th className="py-2.5 pr-4 font-normal">Appointments</th>
              <th className="py-2.5 pr-4 font-normal">No-shows</th>
              <th className="py-2.5 pr-4 font-normal">Rating</th>
              <th className="py-2.5 pr-4 font-normal w-1/3"></th>
            </tr>
          </thead>
          <tbody>
            {data.doctorStats.map((d) => (
              <tr key={d.id} className="border-t border-line">
                <td className="py-3.5 pr-4 text-ink">{d.name}</td>
                <td className="py-3.5 pr-4 font-mono text-ink">{d.appointmentCount}</td>
                <td className="py-3.5 pr-4 font-mono text-ink-70">{d.noShowCount}</td>
                <td className="py-3.5 pr-4 font-mono text-ink">
                  {d.reviewCount > 0 ? d.avgRating.toFixed(1) : "—"}
                </td>
                <td className="py-3.5 pr-4">
                  <div className="h-2 bg-line">
                    <div
                      className="h-2 bg-teal/70"
                      style={{ width: `${(d.appointmentCount / data.maxDoctorCount) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {data.doctorStats.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ink-70">No data yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
