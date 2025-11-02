-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "maxParticipants" INTEGER,
    "seedTimeRequired" BOOLEAN NOT NULL DEFAULT false,
    "scheduledTime" DATETIME,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "distance" TEXT,
    "discipline" TEXT,
    "hurdleHeight" TEXT,
    "implementWeight" TEXT,
    "implementSpecs" JSONB,
    "isComponentEvent" BOOLEAN NOT NULL DEFAULT false,
    "parentEventId" TEXT,
    "competitionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "events_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "events_parentEventId_fkey" FOREIGN KEY ("parentEventId") REFERENCES "events" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_events" ("category", "competitionId", "createdAt", "discipline", "distance", "gender", "hurdleHeight", "id", "implementSpecs", "implementWeight", "isCompleted", "maxParticipants", "name", "scheduledTime", "seedTimeRequired", "type", "unit", "updatedAt") SELECT "category", "competitionId", "createdAt", "discipline", "distance", "gender", "hurdleHeight", "id", "implementSpecs", "implementWeight", "isCompleted", "maxParticipants", "name", "scheduledTime", "seedTimeRequired", "type", "unit", "updatedAt" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
