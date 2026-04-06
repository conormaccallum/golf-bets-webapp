-- CreateTable
CREATE TABLE "PreEventPlayerSnapshot" (
    "id" TEXT NOT NULL,
    "tour" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventYear" INTEGER NOT NULL,
    "dgId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "skillPred" DOUBLE PRECISION,
    "customPred" DOUBLE PRECISION,
    "pMakeCutDg" DOUBLE PRECISION,
    "pMakeCutModel" DOUBLE PRECISION,
    "top20ProbModel" DOUBLE PRECISION,
    "top20ProbAnchored" DOUBLE PRECISION,
    "top20ProbDh" DOUBLE PRECISION,
    "top20ProbAnchoredDh" DOUBLE PRECISION,
    "sgApp" DOUBLE PRECISION,
    "sgOtt" DOUBLE PRECISION,
    "sgArg" DOUBLE PRECISION,
    "sgPutt" DOUBLE PRECISION,
    "sgTotal" DOUBLE PRECISION,
    "drivingAcc" DOUBLE PRECISION,
    "drivingDist" DOUBLE PRECISION,
    "totalFitAdjustment" DOUBLE PRECISION,
    "totalCourseHistoryAdjustment" DOUBLE PRECISION,
    "timingAdjustment" DOUBLE PRECISION,
    "stdDeviation" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreEventPlayerSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PreEventPlayerSnapshot_tour_eventId_capturedAt_idx" ON "PreEventPlayerSnapshot"("tour", "eventId", "capturedAt");

-- CreateIndex
CREATE INDEX "PreEventPlayerSnapshot_tour_eventYear_dgId_idx" ON "PreEventPlayerSnapshot"("tour", "eventYear", "dgId");
