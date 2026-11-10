import { PrismaClient } from "@repo/db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

export default db;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
