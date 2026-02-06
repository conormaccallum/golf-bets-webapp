-- CreateTable
CREATE TABLE "Week" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventYear" INTEGER NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Week_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" SERIAL NOT NULL,
    "weekId" INTEGER NOT NULL,
    "placedAtUtc" TEXT,
    "betType" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "dgId" INTEGER,
    "marketBookBest" TEXT,
    "marketOddsBestDec" DOUBLE PRECISION,
    "stakeUnits" DOUBLE PRECISION,
    "pModel" DOUBLE PRECISION,
    "edgeProb" DOUBLE PRECISION,
    "evPerUnit" DOUBLE PRECISION,
    "kellyFull" DOUBLE PRECISION,
    "kellyFrac" DOUBLE PRECISION,
    "resultWinFlag" INTEGER,
    "returnUnits" DOUBLE PRECISION,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Week_eventId_key" ON "Week"("eventId");

-- CreateIndex
CREATE INDEX "Week_createdAt_idx" ON "Week"("createdAt");

-- CreateIndex
CREATE INDEX "Bet_weekId_idx" ON "Bet"("weekId");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE CASCADE ON UPDATE CASCADE;
