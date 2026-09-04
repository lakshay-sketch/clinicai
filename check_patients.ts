import { prisma } from "./src/server/lib/prisma";
async function main() {
  const count = await prisma.patient.count();
  console.log("Patient count:", count);
  const all = await prisma.patient.findMany({ take: 5 });
  console.log(JSON.stringify(all, null, 2));
}
main().finally(() => prisma.$disconnect());
