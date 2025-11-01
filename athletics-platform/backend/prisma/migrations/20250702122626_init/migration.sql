-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLogin" DATETIME
);

-- CreateTable
CREATE TABLE "athletes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "club" TEXT,
    "category" TEXT NOT NULL,
    "nationality" TEXT,
    "classification" TEXT,
    "isParaAthlete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "venue" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
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

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "maxParticipants" INTEGER,
    "seedTimeRequired" BOOLEAN NOT NULL DEFAULT false,
    "competitionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "events_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentAmount" DECIMAL,
    "paymentDate" DATETIME,
    "seedTime" TEXT,
    "notes" TEXT,
    "bibNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "registrations_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "registrations_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "registration_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "seedTime" TEXT,
    CONSTRAINT "registration_events_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "registration_events_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "results" (
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
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "isDNF" BOOLEAN NOT NULL DEFAULT false,
    "isDNS" BOOLEAN NOT NULL DEFAULT false,
    "isDQ" BOOLEAN NOT NULL DEFAULT false,
    "isPersonalBest" BOOLEAN NOT NULL DEFAULT false,
    "isSeasonBest" BOOLEAN NOT NULL DEFAULT false,
    "isNationalRecord" BOOLEAN NOT NULL DEFAULT false,
    "isWorldRecord" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "results_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "results_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "results_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_athleteId_competitionId_key" ON "registrations"("athleteId", "competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "registration_events_registrationId_eventId_key" ON "registration_events"("registrationId", "eventId");
