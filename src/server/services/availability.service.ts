import { availabilityRepo } from "@/server/repositories/availability.repo";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export const availabilityService = {
  getSlotsForDate: async (doctorId: string, dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00.000Z`);
    const dayOfWeek = date.getUTCDay(); // 0=Sunday..6=Saturday, matches Availability.dayOfWeek

    const [weeklyRows, leave, bookedTimes] = await Promise.all([
      availabilityRepo.getWeeklyRows(doctorId, dayOfWeek),
      availabilityRepo.getLeaveForDate(doctorId, date),
      availabilityRepo.getBookedStartTimes(doctorId, date),
    ]);

    // Full-day leave wipes the whole day
    if (leave && leave.leaveType === "FULL_DAY") {
      return [];
    }

    const bookedSet = new Set(bookedTimes);
    const slots: string[] = [];

    for (const row of weeklyRows) {
      let cursor = timeToMinutes(row.startTime);
      const end = timeToMinutes(row.endTime);

      while (cursor + row.slotDurationMinutes <= end) {
        const slotTime = minutesToTime(cursor);

        // Partial-day leave: skip slots inside the leave's custom window
        const insideLeave =
          leave &&
          leave.leaveType === "PARTIAL_DAY" &&
          leave.customStartTime &&
          leave.customEndTime &&
          cursor >= timeToMinutes(leave.customStartTime) &&
          cursor < timeToMinutes(leave.customEndTime);

        if (!insideLeave && !bookedSet.has(slotTime)) {
          slots.push(slotTime);
        }

        cursor += row.slotDurationMinutes;
      }
    }

    return slots.sort();
  },
};

import { appointmentRepo } from "@/server/repositories/availability.repo";
import { ValidationError, NotFoundError } from "@/server/lib/errors";
import type { Actor } from "@/server/middleware/withAuth";

export const appointmentService = {
  book: async (actor: Actor, params: { doctorId: string; date: string; startTime: string }) => {
    if (actor.type !== "PATIENT") {
      throw new NotFoundError("Not permitted");
    }

    // Re-derive the free slots right now and confirm the requested time is
    // actually still in that list — this is a second, business-rule-level
    // check on top of the transaction's DB-level check, catching cases like
    // "the doctor is on leave" or "outside working hours" that a plain
    // clash-check on Appointment rows alone wouldn't catch.
    const validSlots = await availabilityService.getSlotsForDate(params.doctorId, params.date);
    if (!validSlots.includes(params.startTime)) {
      throw new ValidationError("That slot is not available");
    }

    const date = new Date(`${params.date}T00:00:00.000Z`);
    const appointment = await appointmentRepo.bookIfFree({
      patientId: actor.id,
      doctorId: params.doctorId,
      date,
      startTime: params.startTime,
    });

    if (!appointment) {
      throw new ValidationError("That slot was just booked by someone else — please pick another");
    }

    return appointment;
  },
};

import { appointmentCancelRepo } from "@/server/repositories/availability.repo";

export const appointmentCancelService = {
  cancel: async (actor: Actor, appointmentId: string) => {
    if (actor.type !== "PATIENT") {
      throw new NotFoundError("Appointment not found");
    }

    const count = await appointmentCancelRepo.cancelById(appointmentId, actor.id);
    if (count === 0) {
      throw new NotFoundError("Appointment not found");
    }
  },
};
