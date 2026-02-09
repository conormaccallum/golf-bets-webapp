-- CreateEnum
CREATE TYPE "BetslipStatus" AS ENUM ('PENDING', 'PLACED');

-- CreateTable
CREATE TABLE "BetslipItem" (
    "id" TEXT NOT NULL,
    "uniqueKey" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventYear" INTEGER NOT NULL,
    "market" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "dgId" TEXT,
    "opponents" TEXT,
    "marketBookBest" TEXT,
    "marketOddsBestDec" DOUBLE PRECISION,
    "oddsEnteredDec" DOUBLE PRECISION,
    "pModel" DOUBLE PRECISION,
    "edgeProb" DOUBLE PRECISION,
    "evPerUnit" DOUBLE PRECISION,
    "kellyFull" DOUBLE PRECISION,
    "kellyFrac" DOUBLE PRECISION,
    "stakeUnits" DOUBLE PRECISION,
    "status" "BetslipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BetslipItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BetslipItem_uniqueKey_key" ON "BetslipItem"("uniqueKey");
