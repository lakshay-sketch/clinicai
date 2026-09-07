import { NextResponse } from "next/server";
import { prisma } from "@/server/lib/prisma";
import { emailService } from "@/server/services/email.service";

// Triggered daily by Vercel Cron (see vercel.json). Finds every confirmed,
// scheduled appointment happening tomorrow and sends a reminder email.
// Protected by CRON_SECRET so this can't be triggered by random requests.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowDateOnly = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate()));

  const appointments = await prisma.appointment.findMany({
    where: {
      date: tomorrowDateOnly,
      type: "SCHEDULED",
      status: "confirmed",
    },
    include: { patient: true, doctor: { include: { clinic: true } } },
  });

  const results = [];
  for (const appt of appointments) {
    const result = await emailService.sendAppointmentReminder({
      to: appt.patient.email,
      patientName: appt.patient.name,
      doctorName: appt.doctor.name,
      clinicName: appt.doctor.clinic.name,
      date: appt.date.toISOString().split("T")[0],
      startTime: appt.startTime,
    });
    results.push({ appointmentId: appt.id, ...result });
  }

  return NextResponse.json({ success: true, remindersSent: results.length, results });
}
