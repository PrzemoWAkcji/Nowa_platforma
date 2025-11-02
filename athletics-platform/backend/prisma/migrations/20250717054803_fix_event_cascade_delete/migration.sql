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
    CONSTRAINT "results_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "results_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_results" ("athleteId", "createdAt", "dopingControlStatus", "eventId", "id", "isDNF", "isDNS", "isDQ", "isNationalRecord", "isPersonalBest", "isSeasonBest", "isValid", "isWorldRecord", "notes", "points", "position", "reaction", "registrationId", "result", "selectedForDopingControl", "splits", "updatedAt", "wind") SELECT "athleteId", "createdAt", "dopingControlStatus", "eventId", "id", "isDNF", "isDNS", "isDQ", "isNationalRecord", "isPersonalBest", "isSeasonBest", "isValid", "isWorldRecord", "notes", "points", "position", "reaction", "registrationId", "result", "selectedForDopingControl", "splits", "updatedAt", "wind" FROM "results";
DROP TABLE "results";
ALTER TABLE "new_results" RENAME TO "results";
CREATE UNIQUE INDEX "results_athleteId_eventId_key" ON "results"("athleteId", "eventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
