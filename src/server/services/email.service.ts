// Uses Resend's REST API directly (no SDK) to send appointment reminder
// emails. Note: on Resend's free/sandbox tier without a verified domain,
// emails can only be delivered to the address the Resend account was
// created with — fine for demo/testing, a verified domain would be needed
// to email real patients broadly.

export const emailService = {
  sendAppointmentReminder: async (params: {
    to: string;
    patientName: string;
    doctorName: string;
    clinicName: string;
    date: string;
    startTime: string | null;
  }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { sent: false, reason: "No RESEND_API_KEY set" };

    const timeLabel = params.startTime ? `at ${params.startTime}` : "";

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ClinicAI <onboarding@resend.dev>",
          to: [params.to],
          subject: `Reminder: your appointment with ${params.doctorName} tomorrow`,
          html: `
            <p>Hi ${params.patientName},</p>
            <p>This is a reminder of your upcoming appointment:</p>
            <ul>
              <li><strong>Doctor:</strong> ${params.doctorName}</li>
              <li><strong>Clinic:</strong> ${params.clinicName}</li>
              <li><strong>Date:</strong> ${params.date} ${timeLabel}</li>
            </ul>
            <p>If you need to cancel, you can do so from your ClinicAI account under "My Appointments."</p>
          `,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return { sent: false, reason: errText };
      }
      return { sent: true };
    } catch (err) {
      return { sent: false, reason: String(err) };
    }
  },
};
