-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_athletes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "club" TEXT,
    "category" TEXT NOT NULL,
    "nationality" TEXT,
    "licenseNumber" TEXT,
    "classification" TEXT,
    "isParaAthlete" BOOLEAN NOT NULL DEFAULT false,
    "coachId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "athletes_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_athletes" ("category", "classification", "club", "createdAt", "dateOfBirth", "firstName", "gender", "id", "isParaAthlete", "lastName", "licenseNumber", "nationality", "updatedAt") SELECT "category", "classification", "club", "createdAt", "dateOfBirth", "firstName", "gender", "id", "isParaAthlete", "lastName", "licenseNumber", "nationality", "updatedAt" FROM "athletes";
DROP TABLE "athletes";
ALTER TABLE "new_athletes" RENAME TO "athletes";
CREATE UNIQUE INDEX "athletes_licenseNumber_key" ON "athletes"("licenseNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
