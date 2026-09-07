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

export default async function MyAppointmentsPage() {
  const appointments = await getMyAppointments();

  if (appointments === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <p className="max-w-2xl mx-auto px-6 py-10 text-sm text-ink-60">
          Please sign in to view your appointments.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="max-w-2xl mx-auto px-6 py-10 w-full">
        <h1 className="font-serif text-2xl text-ink">My Appointments</h1>
        <p className="text-sm text-ink-60 mt-1">All your scheduled and past visits.</p>

        <div className="mt-8 divide-y divide-line border-t border-line">
          {appointments.length === 0 && (
            <p className="py-6 text-sm text-ink-60">You have no appointments yet.</p>
          )}
          {appointments.map((a) => (
            <div key={a.id} className="py-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-ink font-medium">{a.doctor.name}</p>
                  <p className="text-sm text-ink-60 mt-0.5">
                    {a.doctor.specialization.name} · {a.doctor.clinic.name}
                  </p>
                  <p className="text-sm text-ink-60 mt-0.5 font-mono">
                    {a.date.toISOString().split("T")[0]} {a.startTime ? `at ${a.startTime}` : "(walk-in)"}
                  </p>
                  <p className="text-xs mt-1">
                    <span
                      className={
                        a.status === "confirmed"
                          ? "text-teal"
                          : a.status === "cancelled"
                          ? "text-red"
                          : "text-ink-60"
                      }
                    >
                      {a.status}
                    </span>
                  </p>
                </div>
                {a.status === "confirmed" && a.type === "SCHEDULED" && (
                  <CancelButton appointmentId={a.id} />
                )}
              </div>

              {a.status === "completed" && (
                <div className="mt-3">
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
