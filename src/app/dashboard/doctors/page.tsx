import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/lib/prisma";
import AddDoctorForm from "./AddDoctorForm";
import { DoctorAvatar } from "@/components/DoctorAvatar";

async function getDoctors() {
  const { userId } = await auth();
  if (!userId) return null;

  const staff = await prisma.staffUser.findUnique({ where: { clerkUserId: userId } });
  if (!staff) return null;

  const doctors = await prisma.doctor.findMany({
    where: { clinicId: staff.clinicId, isActive: true },
    include: { specialization: true },
    orderBy: { name: "asc" },
  });

  return { doctors, isAdmin: staff.role === "ADMIN" };
}

export default async function DoctorsPage() {
  const data = await getDoctors();
  if (!data) return <p className="text-sm text-ink-70">Unable to load doctors.</p>;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-2xl text-ink">Doctors</h1>
        <span className="text-sm text-ink-50 font-mono">{data.doctors.length} active</span>
      </div>

      {data.isAdmin && (
        <div className="mt-6 border border-line p-6">
          <h2 className="text-sm font-medium text-ink mb-4">Add a doctor</h2>
          <AddDoctorForm />
        </div>
      )}

      <table className="mt-10 w-full text-sm border-t border-line">
        <thead>
          <tr className="text-left text-ink-50">
            <th className="py-2.5 pr-4 font-normal">Name</th>
            <th className="py-2.5 pr-4 font-normal">Specialization</th>
            <th className="py-2.5 pr-4 font-normal">Fee</th>
            <th className="py-2.5 pr-4 font-normal">Rating</th>
          </tr>
        </thead>
        <tbody>
          {data.doctors.map((doc) => (
            <tr key={doc.id} className="border-t border-line">
              <td className="py-3.5 pr-4 text-ink">
                <div className="flex items-center gap-3">
                  <DoctorAvatar name={doc.name} size={28} />
                  {doc.name}
                </div>
              </td>
              <td className="py-3.5 pr-4 text-ink-70">{doc.specialization.name}</td>
              <td className="py-3.5 pr-4 font-mono text-ink">₹{doc.consultationFee}</td>
              <td className="py-3.5 pr-4 font-mono text-ink">
                {doc.reviewCount > 0 ? doc.avgRating.toFixed(1) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
