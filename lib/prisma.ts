import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makePrisma() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({
    datasourceUrl: url,
  });
}

export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
