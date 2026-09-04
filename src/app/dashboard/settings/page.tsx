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

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Clinic Settings</h1>
      <p className="text-sm text-ink-60 mt-1">
        {data.isAdmin ? "Edit your clinic's details below." : "Viewing your clinic's details."}
      </p>

      <div className="mt-8 max-w-lg">
        <SettingsForm clinic={data.clinic} readOnly={!data.isAdmin} />
      </div>
    </div>
  );
}
