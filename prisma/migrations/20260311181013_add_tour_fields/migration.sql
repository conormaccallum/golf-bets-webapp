-- DropIndex
DROP INDEX "Week_eventId_key";

-- AlterTable
ALTER TABLE "Bet" ADD COLUMN     "tour" TEXT NOT NULL DEFAULT 'pga';

-- AlterTable
ALTER TABLE "BetslipItem" ADD COLUMN     "tour" TEXT NOT NULL DEFAULT 'pga';

-- AlterTable
ALTER TABLE "Week" ADD COLUMN     "tour" TEXT NOT NULL DEFAULT 'pga';

-- CreateIndex
CREATE UNIQUE INDEX "Week_eventId_tour_key" ON "Week"("eventId", "tour");
