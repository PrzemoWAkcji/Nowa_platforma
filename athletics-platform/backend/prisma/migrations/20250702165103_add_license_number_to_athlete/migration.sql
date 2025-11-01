/*
  Warnings:

  - A unique constraint covering the columns `[licenseNumber]` on the table `athletes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "athletes" ADD COLUMN "licenseNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "athletes_licenseNumber_key" ON "athletes"("licenseNumber");
