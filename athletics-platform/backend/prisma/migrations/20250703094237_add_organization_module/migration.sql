-- CreateTable
CREATE TABLE "competition_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "competition_schedules_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schedule_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduleId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "scheduledTime" DATETIME NOT NULL,
    "actualTime" DATETIME,
    "duration" INTEGER,
    "round" TEXT NOT NULL DEFAULT 'QUALIFICATION',
    "seriesCount" INTEGER NOT NULL DEFAULT 1,
    "finalistsCount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "schedule_items_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "competition_schedules" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "schedule_items_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "heats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "heatNumber" INTEGER NOT NULL,
    "round" TEXT NOT NULL,
    "maxLanes" INTEGER NOT NULL DEFAULT 8,
    "scheduledTime" DATETIME,
    "actualTime" DATETIME,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "heats_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "heat_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heatId" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "lane" INTEGER,
    "seedTime" TEXT,
    "seedRank" INTEGER,
    "assignmentMethod" TEXT NOT NULL DEFAULT 'MANUAL',
    "isPresent" BOOLEAN NOT NULL DEFAULT true,
    "isDNS" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "heat_assignments_heatId_fkey" FOREIGN KEY ("heatId") REFERENCES "heats" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "heat_assignments_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "heats_eventId_heatNumber_round_key" ON "heats"("eventId", "heatNumber", "round");

-- CreateIndex
CREATE UNIQUE INDEX "heat_assignments_heatId_lane_key" ON "heat_assignments"("heatId", "lane");

-- CreateIndex
CREATE UNIQUE INDEX "heat_assignments_heatId_registrationId_key" ON "heat_assignments"("heatId", "registrationId");
