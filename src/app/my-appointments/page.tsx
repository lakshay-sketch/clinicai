import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import CancelButton from "./CancelButton";
import ReviewPrompt from "./ReviewPrompt";

async function getMyAppointments() {
  const { userId } = await auth();
  if (!userId) return null;

  const patient = await prisma.patient.findUnique({ where: { clerkUserId: userId } });
  if (!patient) return null;

  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
    include: { doctor: { include: { clinic: true, specialization: true } }, review: true },
    orderBy: { date: "desc" },
  });

  return appointments;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "text-teal",
  cancelled: "text-red",
  completed: "text-ink-50",
  no_show: "text-amber",
  in_consultation: "text-teal",
};

export default async function MyAppointmentsPage() {
  const appointments = await getMyAppointments();

  if (appointments === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <p className="max-w-2xl mx-auto px-6 py-14 text-sm text-ink-70">
          Please sign in to view your appointments.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="max-w-2xl mx-auto px-6 py-14 w-full animate-in">
        <h1 className="font-serif text-3xl text-ink">My Appointments</h1>
        <p className="text-sm text-ink-70 mt-2">All your scheduled and past visits.</p>

        <div className="mt-8 divide-y divide-line border-t border-line">
          {appointments.length === 0 && (
            <p className="py-8 text-sm text-ink-70">You have no appointments yet.</p>
          )}
          {appointments.map((a) => (
            <div key={a.id} className="py-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-ink font-medium">{a.doctor.name}</p>
                  <p className="text-sm text-ink-70 mt-1">
                    {a.doctor.specialization.name} · {a.doctor.clinic.name}
                  </p>
                  <p className="text-sm text-ink-50 mt-0.5 font-mono">
                    {a.date.toISOString().split("T")[0]} {a.startTime ? `at ${a.startTime}` : "(walk-in)"}
                  </p>
                  <p className="text-xs mt-2">
                    <span className={STATUS_STYLES[a.status] ?? "text-ink-50"}>{a.status}</span>
                  </p>
                </div>
                {a.status === "confirmed" && a.type === "SCHEDULED" && (
                  <CancelButton appointmentId={a.id} />
                )}
              </div>

              {a.status === "completed" && (
                <div className="mt-4">
                  {a.review ? (
                    <p className="text-xs text-teal">
                      You rated this visit {a.review.rating}/5. Thanks for the feedback!
                    </p>
                  ) : (
                    <ReviewPrompt appointmentId={a.id} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
