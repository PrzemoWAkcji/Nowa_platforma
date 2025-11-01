-- CreateTable
CREATE TABLE "records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "resultValue" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "wind" TEXT,
    "altitude" INTEGER,
    "isIndoor" BOOLEAN NOT NULL DEFAULT false,
    "athleteName" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "competitionName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "venue" TEXT,
    "date" DATETIME NOT NULL,
    "isRatified" BOOLEAN NOT NULL DEFAULT false,
    "ratifiedBy" TEXT,
    "ratifiedDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "supersededBy" TEXT,
    "supersededDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    CONSTRAINT "records_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "records_supersededBy_fkey" FOREIGN KEY ("supersededBy") REFERENCES "records" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "records_type_eventName_gender_category_idx" ON "records"("type", "eventName", "gender", "category");

-- CreateIndex
CREATE INDEX "records_nationality_eventName_idx" ON "records"("nationality", "eventName");

-- CreateIndex
CREATE INDEX "records_isActive_type_idx" ON "records"("isActive", "type");

-- CreateIndex
CREATE INDEX "records_date_idx" ON "records"("date");
