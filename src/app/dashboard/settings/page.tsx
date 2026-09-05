import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/lib/prisma";
import SettingsForm from "./SettingsForm";

async function getClinic() {
  const { userId } = await auth();
  if (!userId) return null;

  const staff = await prisma.staffUser.findUnique({ where: { clerkUserId: userId } });
  if (!staff) return null;

  const clinic = await prisma.clinic.findUnique({ where: { id: staff.clinicId } });
  return { clinic, isAdmin: staff.role === "ADMIN" };
}

export default async function SettingsPage() {
  const data = await getClinic();
  if (!data || !data.clinic) return <p className="text-sm text-ink-60">Unable to load clinic.</p>;

  const checkinUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://clinicai-555888.vercel.app"}/checkin/${data.clinic.qrToken}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(checkinUrl)}`;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Clinic Settings</h1>
      <p className="text-sm text-ink-60 mt-1">
        {data.isAdmin ? "Edit your clinic's details below." : "Viewing your clinic's details."}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-10 max-w-3xl">
        <SettingsForm clinic={data.clinic} readOnly={!data.isAdmin} />

        <div>
          <h2 className="text-sm font-medium text-ink mb-3">Walk-in check-in QR code</h2>
          <div className="border border-line p-4 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrImageUrl} alt="Clinic check-in QR code" width={220} height={220} />
          </div>
          <p className="text-xs text-ink-60 mt-3 max-w-xs">
            Print this and display it at reception. Patients scan it to join the walk-in queue.
          </p>
        </div>
      </div>
    </div>
  );
}
