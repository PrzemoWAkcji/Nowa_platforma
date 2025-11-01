-- CreateTable
CREATE TABLE "protests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competitionId" TEXT NOT NULL,
    "eventId" TEXT,
    "resultId" TEXT,
    "athleteId" TEXT,
    "submittedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "decision" TEXT,
    "feeAmount" REAL,
    "feePaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reviewedAt" DATETIME,
    CONSTRAINT "protests_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "protests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "protests_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "protests_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "protests_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "protests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "position" INTEGER,
    "points" INTEGER,
    "wind" TEXT,
    "reaction" TEXT,
    "splits" JSONB,
    "notes" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "isDNF" BOOLEAN NOT NULL DEFAULT false,
    "isDNS" BOOLEAN NOT NULL DEFAULT false,
    "isDQ" BOOLEAN NOT NULL DEFAULT false,
    "isPersonalBest" BOOLEAN NOT NULL DEFAULT false,
    "isSeasonBest" BOOLEAN NOT NULL DEFAULT false,
    "isNationalRecord" BOOLEAN NOT NULL DEFAULT false,
    "isWorldRecord" BOOLEAN NOT NULL DEFAULT false,
    "selectedForDopingControl" BOOLEAN NOT NULL DEFAULT false,
    "dopingControlStatus" TEXT NOT NULL DEFAULT 'NOT_SELECTED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "results_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "results_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "results_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_results" ("athleteId", "createdAt", "eventId", "id", "isDNF", "isDNS", "isDQ", "isNationalRecord", "isPersonalBest", "isSeasonBest", "isValid", "isWorldRecord", "notes", "points", "position", "reaction", "registrationId", "result", "splits", "updatedAt", "wind") SELECT "athleteId", "createdAt", "eventId", "id", "isDNF", "isDNS", "isDQ", "isNationalRecord", "isPersonalBest", "isSeasonBest", "isValid", "isWorldRecord", "notes", "points", "position", "reaction", "registrationId", "result", "splits", "updatedAt", "wind" FROM "results";
DROP TABLE "results";
ALTER TABLE "new_results" RENAME TO "results";
CREATE UNIQUE INDEX "results_athleteId_eventId_key" ON "results"("athleteId", "eventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
