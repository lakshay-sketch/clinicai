import { auth } from "@clerk/nextjs/server";
import {
  CalendarCheck,
  CheckCircle2,
  UserX,
  IndianRupee,
  Star,
  Info,
} from "lucide-react";
import { prisma } from "@/server/lib/prisma";
import AnalyticsControls from "./AnalyticsControls";

async function getAnalytics() {
  const { userId } = await auth();
  if (!userId) return null;

  const staff = await prisma.staffUser.findUnique({ where: { clerkUserId: userId } });
  if (!staff) return null;

  const doctors = await prisma.doctor.findMany({
    where: { clinicId: staff.clinicId, isActive: true },
    include: { specialization: true },
  });
  const doctorIds = doctors.map((d) => d.id);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
  const thirtyDaysAgoDateOnly = new Date(
    Date.UTC(thirtyDaysAgo.getUTCFullYear(), thirtyDaysAgo.getUTCMonth(), thirtyDaysAgo.getUTCDate())
  );

  const recentAppointments = await prisma.appointment.findMany({
    where: { doctorId: { in: doctorIds }, date: { gte: thirtyDaysAgoDateOnly } },
  });

  const total = recentAppointments.length;
  const completed = recentAppointments.filter((a) => a.status === "completed").length;
  const noShow = recentAppointments.filter((a) => a.status === "no_show").length;
  const cancelled = recentAppointments.filter((a) => a.status === "cancelled").length;
  const scheduled = recentAppointments.filter((a) => a.type === "SCHEDULED").length;
  const walkIn = recentAppointments.filter((a) => a.type === "WALK_IN").length;
  const inProgress = total - completed - noShow - cancelled;

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
  const totalInWindow = dayBuckets.reduce((s, d) => s + d.count, 0);

  // Doctor leaderboard
  const doctorStats = doctors
    .map((d) => {
      const apps = recentAppointments.filter((a) => a.doctorId === d.id);
      return {
        id: d.id,
        name: d.name,
        specialization: d.specialization?.name ?? null,
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
    total, completed, noShow, cancelled, scheduled, walkIn, inProgress,
    noShowRate, completionRate, estimatedRevenue, avgRating, reviewCount,
    dayBuckets, maxDayCount, totalInWindow, doctorStats, maxDoctorCount,
    rangeFrom: thirtyDaysAgoDateOnly,
    rangeTo: new Date(),
  };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  if (!data) return <p className="text-sm text-ink-70">Unable to load analytics.</p>;

  const cardShadow = "shadow-[0_1px_3px_rgba(18,35,61,0.05),0_8px_24px_-16px_rgba(18,35,61,0.12)]";

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink tracking-tight">Analytics</h1>
          <p className="text-xs text-ink-50 uppercase tracking-wide mt-2">
            {formatDate(data.rangeFrom)} – {formatDate(data.rangeTo)} · Last 30 days
          </p>
        </div>
        <AnalyticsControls doctorStats={data.doctorStats} />
      </div>

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`bg-paper rounded-xl border border-line ${cardShadow} p-6 group`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-ink-50 uppercase tracking-wide">Total appointments</p>
            <span className="w-7 h-7 rounded-md bg-teal-soft flex items-center justify-center text-teal">
              <CalendarCheck size={15} strokeWidth={1.75} />
            </span>
          </div>
          <p className="font-mono text-4xl text-ink mt-3 font-semibold">{data.total}</p>
          <p className="text-xs text-ink-50 mt-1.5">
            {data.scheduled} scheduled · {data.walkIn} walk-in
          </p>
          <div className="h-px w-8 bg-teal/30 mt-4 group-hover:w-full group-hover:bg-teal transition-all duration-300" />
        </div>

        <div className={`bg-paper rounded-xl border border-line ${cardShadow} p-6 group`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-ink-50 uppercase tracking-wide">Completion rate</p>
            <span className="w-7 h-7 rounded-md bg-teal-soft flex items-center justify-center text-teal">
              <CheckCircle2 size={15} strokeWidth={1.75} />
            </span>
          </div>
          <p className="font-mono text-4xl text-teal mt-3 font-semibold">{data.completionRate.toFixed(0)}%</p>
          <p className="text-xs text-ink-50 mt-1.5">
            {data.completed} completed
            {data.inProgress > 0 ? ` · ${data.inProgress} scheduled/upcoming` : ""}
          </p>
          <div className="h-px w-8 bg-teal/30 mt-4 group-hover:w-full group-hover:bg-teal transition-all duration-300" />
        </div>

        <div className={`bg-paper rounded-xl border border-line ${cardShadow} p-6 group`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-ink-50 uppercase tracking-wide">No-show rate</p>
            <span className="w-7 h-7 rounded-md bg-teal-soft flex items-center justify-center text-teal">
              <UserX size={15} strokeWidth={1.75} />
            </span>
          </div>
          <p className={`font-mono text-4xl mt-3 font-semibold ${data.noShowRate > 15 ? "text-amber" : "text-ink"}`}>
            {data.noShowRate.toFixed(0)}%
          </p>
          <p className="text-xs text-ink-50 mt-1.5">{data.noShow} no-shows</p>
          <div className="h-px w-8 bg-teal/30 mt-4 group-hover:w-full group-hover:bg-teal transition-all duration-300" />
        </div>

        <div className={`bg-paper rounded-xl border border-line ${cardShadow} p-6 group`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-ink-50 uppercase tracking-wide">Est. revenue</p>
            <span className="w-7 h-7 rounded-md bg-amber/10 flex items-center justify-center text-amber">
              <IndianRupee size={15} strokeWidth={1.75} />
            </span>
          </div>
          <p className="font-mono text-4xl text-ink mt-3 font-semibold">
            ₹{data.estimatedRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-ink-50 mt-1.5 flex items-center gap-1">
            {data.reviewCount > 0 ? (
              <>
                <Star size={11} className="text-amber fill-amber" /> {data.avgRating.toFixed(1)} avg rating (
                {data.reviewCount} reviews)
              </>
            ) : (
              "No reviews yet"
            )}
          </p>
          <div className="h-px w-8 bg-amber/30 mt-4 group-hover:w-full group-hover:bg-amber transition-all duration-300" />
        </div>
      </section>

      {/* 14-day chart */}
      <section className={`bg-paper rounded-xl border border-line ${cardShadow} p-6 sm:p-8`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <h2 className="font-serif text-lg text-ink">Appointments, last 14 days</h2>
          <span className="text-xs text-ink-50 font-mono">{data.totalInWindow} total in window</span>
        </div>

        {data.totalInWindow === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-t border-line">
            <Info size={18} className="text-ink-50 mb-2" strokeWidth={1.5} />
            <p className="text-sm text-ink-70">No appointments in this range yet.</p>
            <p className="text-xs text-ink-50 mt-1">New bookings will start filling in this chart automatically.</p>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-1.5 sm:gap-2 h-40 border-b border-line pb-2 relative">
              <div className="absolute inset-0 bottom-2 flex flex-col justify-between pointer-events-none">
                {[1, 0.5, 0].map((f) => (
                  <div key={f} className="w-full border-t border-line/60" />
                ))}
              </div>
              {data.dayBuckets.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group relative z-10">
                  <span className="text-[11px] mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity font-mono bg-ink text-paper px-1.5 py-0.5 rounded">
                    {day.count}
                  </span>
                  {day.count > 0 ? (
                    <div
                      className="w-full max-w-[22px] bg-teal/70 group-hover:bg-teal transition-colors rounded-t-sm"
                      style={{ height: `${(day.count / data.maxDayCount) * 100}%`, minHeight: "3px" }}
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-line-strong group-hover:bg-teal/50 transition-colors" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 sm:gap-2 mt-2">
              {data.dayBuckets.map((day) => (
                <span key={day.date} className="flex-1 text-[10px] text-ink-50 text-center font-mono">
                  {day.date.slice(5)}
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Doctor performance */}
      <section className={`bg-paper rounded-xl border border-line ${cardShadow} overflow-hidden`}>
        <div className="p-6 border-b border-line">
          <h2 className="font-serif text-lg text-ink">Doctor performance</h2>
          <p className="text-xs text-ink-50 mt-1">Share of appointment volume across active doctors, last 30 days</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-50 bg-line/10">
                <th className="py-3 px-6 font-normal text-xs uppercase tracking-wide">Doctor</th>
                <th className="py-3 px-4 font-normal text-xs uppercase tracking-wide w-1/3">Appointments</th>
                <th className="py-3 px-4 font-normal text-xs uppercase tracking-wide text-center">No-shows</th>
                <th className="py-3 px-6 font-normal text-xs uppercase tracking-wide">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.doctorStats.map((d) => {
                const share = data.total > 0 ? (d.appointmentCount / data.total) * 100 : 0;
                const isQuiet = d.appointmentCount === 0;
                return (
                  <tr key={d.id} className={`hover:bg-line/10 transition-colors ${isQuiet ? "opacity-60" : ""}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-teal-soft text-teal flex items-center justify-center font-serif text-xs font-semibold shrink-0">
                          {d.name
                            .split(" ")
                            .map((p) => p[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <div>
                          <p className="text-ink font-medium">{d.name}</p>
                          {d.specialization && <p className="text-xs text-ink-50">{d.specialization}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-ink">{d.appointmentCount}</span>
                          <span className="font-mono text-xs text-ink-50">{share.toFixed(1)}% share</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-line overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isQuiet ? "bg-line-strong" : "bg-teal"}`}
                            style={{ width: `${(d.appointmentCount / data.maxDoctorCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-ink-70">{d.noShowCount}</td>
                    <td className="py-4 px-6">
                      {d.reviewCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-mono text-ink">
                          <Star size={12} className="text-amber fill-amber" />
                          {d.avgRating.toFixed(1)}
                          <span className="text-ink-50 text-xs">({d.reviewCount})</span>
                        </span>
                      ) : (
                        <span className="text-ink-50 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {data.doctorStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-ink-70">
                    No data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
