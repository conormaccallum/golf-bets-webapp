-- CreateTable
CREATE TABLE "Week" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT NOT NULL,
    "eventName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekId" INTEGER NOT NULL,
    "placedAtUtc" TEXT,
    "betType" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "dgId" INTEGER,
    "marketBookBest" TEXT,
    "marketOddsBestDec" REAL,
    "stakeUnits" REAL,
    "pModel" REAL,
    "edgeProb" REAL,
    "evPerUnit" REAL,
    "kellyFull" REAL,
    "kellyFrac" REAL,
    "resultWinFlag" INTEGER,
    "returnUnits" REAL,
    CONSTRAINT "Bet_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Week_createdAt_idx" ON "Week"("createdAt");

-- CreateIndex
CREATE INDEX "Bet_weekId_idx" ON "Bet"("weekId");
