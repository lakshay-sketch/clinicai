import type { Actor } from "@/server/middleware/withAuth";
import { ForbiddenError } from "@/server/lib/errors";

type StaffRole = "ADMIN" | "RECEPTION";

export type RoleRequirement =
  | { type: "PATIENT" }
  | { type: "STAFF"; roles?: StaffRole[] }; // roles omitted = any staff role allowed

export function requireRole(actor: Actor, requirement: RoleRequirement): void {
  if (requirement.type === "PATIENT") {
    if (actor.type !== "PATIENT") {
      throw new ForbiddenError("This action requires a patient account");
    }
    return;
  }

  // requirement.type === "STAFF"
  if (actor.type !== "STAFF") {
    throw new ForbiddenError("This action requires a staff account");
  }

  if (requirement.roles && !requirement.roles.includes(actor.role as StaffRole)) {
    throw new ForbiddenError(
      `This action requires one of the following roles: ${requirement.roles.join(", ")}`
    );
  }
}
