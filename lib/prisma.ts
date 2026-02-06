import { PrismaClient } from "../prisma/generated/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export function getPrisma() {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({ log: ["error"] });
  }
  return global.__prisma;
}
