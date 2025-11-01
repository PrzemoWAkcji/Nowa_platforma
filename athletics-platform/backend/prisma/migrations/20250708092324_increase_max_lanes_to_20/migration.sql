-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_heats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "heatNumber" INTEGER NOT NULL,
    "round" TEXT NOT NULL,
    "maxLanes" INTEGER NOT NULL DEFAULT 20,
    "scheduledTime" DATETIME,
    "actualTime" DATETIME,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "heats_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_heats" ("actualTime", "createdAt", "eventId", "heatNumber", "id", "isCompleted", "maxLanes", "notes", "round", "scheduledTime", "updatedAt") SELECT "actualTime", "createdAt", "eventId", "heatNumber", "id", "isCompleted", "maxLanes", "notes", "round", "scheduledTime", "updatedAt" FROM "heats";
DROP TABLE "heats";
ALTER TABLE "new_heats" RENAME TO "heats";
CREATE UNIQUE INDEX "heats_eventId_heatNumber_round_key" ON "heats"("eventId", "heatNumber", "round");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
