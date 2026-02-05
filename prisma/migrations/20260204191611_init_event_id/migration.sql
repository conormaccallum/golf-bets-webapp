/*
  Warnings:

  - Added the required column `eventId` to the `Week` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventYear` to the `Week` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Week" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventYear" INTEGER NOT NULL,
    "eventId" TEXT NOT NULL
);
INSERT INTO "new_Week" ("createdAt", "eventName", "id", "label") SELECT "createdAt", "eventName", "id", "label" FROM "Week";
DROP TABLE "Week";
ALTER TABLE "new_Week" RENAME TO "Week";
CREATE UNIQUE INDEX "Week_eventId_key" ON "Week"("eventId");
CREATE INDEX "Week_createdAt_idx" ON "Week"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
