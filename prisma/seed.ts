import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "../src/server/lib/prisma";

const seedData = JSON.parse(
  readFileSync(join(process.cwd(), "seed-data.json"), "utf-8")
);

async function main() {
  console.log("Seeding specializations...");
  for (const s of seedData.specializations) {
    await prisma.specialization.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }

  console.log("Seeding clinics...");
  for (const c of seedData.clinics) {
    await prisma.clinic.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        address: c.address,
        area: c.area,
        city: "Mumbai",
        pincode: c.pincode,
        latitude: c.lat,
        longitude: c.lng,
        phone: c.phone,
        email: c.email,
      },
    });
  }

  console.log("Seeding doctors...");
  for (const d of seedData.doctors) {
    // seed-data.json has `rating`; schema v3.0 renamed this to avgRating + reviewCount
    // (see SCHEMA_CHANGES.md §6). Strip `rating` out and remap it explicitly.
    const { rating, ...rest } = d;
    await prisma.doctor.upsert({
      where: { id: d.id },
      update: {},
      create: { ...rest, avgRating: rating, reviewCount: 0 },
    });
  }

  console.log("Seeding availability...");
  for (const a of seedData.availability) {
    await prisma.availability.upsert({
      where: { id: a.id },
      update: {},
      create: a,
    });
  }

  console.log("Seeding FAQs...");
  for (const f of seedData.faqs) {
    await prisma.fAQ.upsert({
      where: { id: f.id },
      update: {},
      create: f,
    });
  }

  console.log("Seeding patients...");
  for (const p of seedData.patients) {
    await prisma.patient.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  console.log("Seeding appointments...");
  for (const a of seedData.appointments) {
    await prisma.appointment.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, date: new Date(a.date) },
    });
  }

  console.log("Seeding queue entries...");
  for (const q of seedData.queueEntries) {
    await prisma.queueEntry.upsert({
      where: { id: q.id },
      update: {},
      create: {
        ...q,
        // seed-data.json has no queueNumber (schema field didn't exist when it was
        // generated). Demo data has clean sequential `position` values per doctor
        // (1, 2, 3...) generated in check-in order, so reusing position as the
        // immutable ticket number is safe here.
        queueNumber: q.position,
        queueDate: new Date(q.queueDate),
        joinedAt: new Date(q.joinedAt),
        calledAt: q.calledAt ? new Date(q.calledAt) : null,
        consultationStartedAt: q.consultationStartedAt ? new Date(q.consultationStartedAt) : null,
        consultationEndedAt: q.consultationEndedAt ? new Date(q.consultationEndedAt) : null,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`  Specializations: ${seedData.specializations.length}`);
  console.log(`  Clinics: ${seedData.clinics.length}`);
  console.log(`  Doctors: ${seedData.doctors.length}`);
  console.log(`  Availability rows: ${seedData.availability.length}`);
  console.log(`  FAQs: ${seedData.faqs.length}`);
  console.log(`  Patients: ${seedData.patients.length}`);
  console.log(`  Appointments: ${seedData.appointments.length}`);
  console.log(`  Queue entries: ${seedData.queueEntries.length}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
