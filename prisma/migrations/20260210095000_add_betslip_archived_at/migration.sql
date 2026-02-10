-- Add archivedAt to betslip items so manual/weekly archive doesn't duplicate
ALTER TABLE "BetslipItem" ADD COLUMN "archivedAt" TIMESTAMP(3);
