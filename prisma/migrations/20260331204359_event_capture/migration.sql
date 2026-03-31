-- CreateTable
CREATE TABLE "EventSnapshot" (
    "id" TEXT NOT NULL,
    "tour" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventYear" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OddsSnapshot" (
    "id" TEXT NOT NULL,
    "tour" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventYear" INTEGER NOT NULL,
    "market" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "dgId" INTEGER,
    "playerName" TEXT,
    "oddsDec" DOUBLE PRECISION,
    "marketProb" DOUBLE PRECISION,
    "opponents" TEXT,
    "groupId" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OddsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSg" (
    "id" TEXT NOT NULL,
    "tour" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventYear" INTEGER NOT NULL,
    "dgId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "sgOtt" DOUBLE PRECISION,
    "sgApp" DOUBLE PRECISION,
    "sgArg" DOUBLE PRECISION,
    "sgPutt" DOUBLE PRECISION,
    "sgTotal" DOUBLE PRECISION,
    "rounds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventResult" (
    "id" TEXT NOT NULL,
    "tour" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventYear" INTEGER NOT NULL,
    "dgId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "finishPos" INTEGER,
    "earnings" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventSnapshot_tour_eventId_capturedAt_idx" ON "EventSnapshot"("tour", "eventId", "capturedAt");

-- CreateIndex
CREATE INDEX "OddsSnapshot_tour_eventId_market_capturedAt_idx" ON "OddsSnapshot"("tour", "eventId", "market", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventSg_tour_eventId_eventYear_dgId_key" ON "EventSg"("tour", "eventId", "eventYear", "dgId");

-- CreateIndex
CREATE UNIQUE INDEX "EventResult_tour_eventId_eventYear_dgId_key" ON "EventResult"("tour", "eventId", "eventYear", "dgId");
