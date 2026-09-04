import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/lib/prisma";
import QueueBoard from "./QueueBoard";

async function getClinicDoctors() {
  const { userId } = await auth();
  if (!userId) return null;

  const staff = await prisma.staffUser.findUnique({ where: { clerkUserId: userId } });
  if (!staff) return null;

  const doctors = await prisma.doctor.findMany({
    where: { clinicId: staff.clinicId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return doctors;
}

export default async function QueuePage() {
  const doctors = await getClinicDoctors();
  if (!doctors) return <p className="text-sm text-ink-60">Unable to load doctors.</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Live Queue</h1>
      <p className="text-sm text-ink-60 mt-1">Today's walk-in queue, by doctor.</p>
      <div className="mt-8">
        <QueueBoard doctors={doctors} />
      </div>
    </div>
  );
}
