-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_competitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "venue" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "agentId" TEXT,
    "liveResultsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "liveResultsToken" TEXT,
    "registrationStartDate" DATETIME,
    "registrationEndDate" DATETIME,
    "maxParticipants" INTEGER,
    "registrationFee" DECIMAL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "allowLateRegistration" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "competitions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_competitions" ("allowLateRegistration", "createdAt", "createdById", "description", "endDate", "id", "isPublic", "location", "maxParticipants", "name", "registrationEndDate", "registrationFee", "registrationStartDate", "startDate", "status", "type", "updatedAt", "venue") SELECT "allowLateRegistration", "createdAt", "createdById", "description", "endDate", "id", "isPublic", "location", "maxParticipants", "name", "registrationEndDate", "registrationFee", "registrationStartDate", "startDate", "status", "type", "updatedAt", "venue" FROM "competitions";
DROP TABLE "competitions";
ALTER TABLE "new_competitions" RENAME TO "competitions";
CREATE UNIQUE INDEX "competitions_agentId_key" ON "competitions"("agentId");
CREATE UNIQUE INDEX "competitions_liveResultsToken_key" ON "competitions"("liveResultsToken");
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
    "competitionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "events_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_events" ("category", "competitionId", "createdAt", "discipline", "distance", "gender", "id", "maxParticipants", "name", "scheduledTime", "seedTimeRequired", "type", "unit", "updatedAt") SELECT "category", "competitionId", "createdAt", "discipline", "distance", "gender", "id", "maxParticipants", "name", "scheduledTime", "seedTimeRequired", "type", "unit", "updatedAt" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
