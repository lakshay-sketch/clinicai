import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// The base DATABASE_URL is sometimes injected empty by the runtime, while the
// real Postgres connection string is provided under a suffixed variant
// (e.g. DATABASE_URL_2). Resolve the first candidate that is an actual
// postgres:// URL so both preview and production connect reliably.
function resolveConnectionString(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.DATABASE_URL_2,
    process.env.DATABASE_URL_3,
    process.env.DIRECT_URL,
    process.env.DIRECT_URL_2,
    process.env.DIRECT_URL_3,
  ];

  return candidates.find((value) => {
    if (!value) return false;
    const trimmed = value.trim().replace(/^["']|["']$/g, "");
    return (
      trimmed.startsWith("postgres://") ||
      trimmed.startsWith("postgresql://")
    );
  })?.trim().replace(/^["']|["']$/g, "");
}

const adapter = new PrismaPg({
  connectionString: resolveConnectionString(),
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
