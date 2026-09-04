import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/lib/prisma";
import InviteStaffForm from "./InviteStaffForm";

async function getStaffData() {
  const { userId } = await auth();
  if (!userId) return null;

  const staff = await prisma.staffUser.findUnique({ where: { clerkUserId: userId } });
  if (!staff) return null;

  const clinicStaff = await prisma.staffUser.findMany({
    where: { clinicId: staff.clinicId },
    orderBy: { name: "asc" },
  });

  return { clinicStaff, isAdmin: staff.role === "ADMIN" };
}

export default async function StaffPage() {
  const data = await getStaffData();
  if (!data) return <p className="text-sm text-ink-60">Unable to load staff.</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Staff</h1>
      <p className="text-sm text-ink-60 mt-1">Everyone with access to this clinic's dashboard.</p>

      {data.isAdmin && (
        <div className="mt-6 border border-line p-5">
          <h2 className="text-sm font-medium text-ink mb-3">Invite staff</h2>
          <InviteStaffForm />
        </div>
      )}

      <table className="mt-8 w-full text-sm border-t border-line">
        <thead>
          <tr className="text-left text-ink-60">
            <th className="py-2 pr-4 font-normal">Name</th>
            <th className="py-2 pr-4 font-normal">Email</th>
            <th className="py-2 pr-4 font-normal">Role</th>
            <th className="py-2 pr-4 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.clinicStaff.map((s) => (
            <tr key={s.id} className="border-t border-line">
              <td className="py-3 pr-4 text-ink">{s.name}</td>
              <td className="py-3 pr-4 text-ink-60">{s.email}</td>
              <td className="py-3 pr-4 text-ink-60">{s.role}</td>
              <td className="py-3 pr-4">
                {s.clerkUserId ? (
                  <span className="text-teal text-xs">Active</span>
                ) : (
                  <span className="text-amber text-xs">Pending invite</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
