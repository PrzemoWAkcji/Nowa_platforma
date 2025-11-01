-- CreateTable
CREATE TABLE "relay_teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "club" TEXT,
    "competitionId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "relay_teams_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "relay_teams_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "relay_team_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isReserve" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "relay_team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "relay_teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "relay_team_members_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "relay_team_registrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "seedTime" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "relay_team_registrations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "relay_teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "relay_team_registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "relay_team_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
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
    "isNationalRecord" BOOLEAN NOT NULL DEFAULT false,
    "isWorldRecord" BOOLEAN NOT NULL DEFAULT false,
    "selectedForDopingControl" BOOLEAN NOT NULL DEFAULT false,
    "dopingControlStatus" TEXT NOT NULL DEFAULT 'NOT_SELECTED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "relay_team_results_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "relay_teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "relay_team_results_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_protests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competitionId" TEXT NOT NULL,
    "eventId" TEXT,
    "resultId" TEXT,
    "athleteId" TEXT,
    "relayTeamResultId" TEXT,
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
    CONSTRAINT "protests_relayTeamResultId_fkey" FOREIGN KEY ("relayTeamResultId") REFERENCES "relay_team_results" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "protests_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "protests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_protests" ("athleteId", "competitionId", "createdAt", "decision", "description", "eventId", "evidence", "feeAmount", "feePaid", "id", "reason", "resultId", "reviewNotes", "reviewedAt", "reviewedBy", "status", "submittedBy", "updatedAt") SELECT "athleteId", "competitionId", "createdAt", "decision", "description", "eventId", "evidence", "feeAmount", "feePaid", "id", "reason", "resultId", "reviewNotes", "reviewedAt", "reviewedBy", "status", "submittedBy", "updatedAt" FROM "protests";
DROP TABLE "protests";
ALTER TABLE "new_protests" RENAME TO "protests";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "relay_teams_name_competitionId_key" ON "relay_teams"("name", "competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "relay_team_members_teamId_athleteId_key" ON "relay_team_members"("teamId", "athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "relay_team_members_teamId_position_key" ON "relay_team_members"("teamId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "relay_team_registrations_teamId_eventId_key" ON "relay_team_registrations"("teamId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "relay_team_results_teamId_eventId_key" ON "relay_team_results"("teamId", "eventId");
