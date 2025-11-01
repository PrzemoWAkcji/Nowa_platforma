/*
  Warnings:

  - A unique constraint covering the columns `[athleteId,eventId]` on the table `results` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN "discipline" TEXT;
ALTER TABLE "events" ADD COLUMN "distance" TEXT;
ALTER TABLE "events" ADD COLUMN "scheduledTime" DATETIME;

-- AlterTable
ALTER TABLE "results" ADD COLUMN "notes" TEXT;

-- CreateTable
CREATE TABLE "combined_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "combined_events_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "combined_events_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "combined_event_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "combinedEventId" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "dayOrder" INTEGER NOT NULL,
    "performance" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "wind" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "combined_event_results_combinedEventId_fkey" FOREIGN KEY ("combinedEventId") REFERENCES "combined_events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "combined_events_athleteId_competitionId_eventType_key" ON "combined_events"("athleteId", "competitionId", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "combined_event_results_combinedEventId_discipline_key" ON "combined_event_results"("combinedEventId", "discipline");

-- CreateIndex
CREATE UNIQUE INDEX "results_athleteId_eventId_key" ON "results"("athleteId", "eventId");
