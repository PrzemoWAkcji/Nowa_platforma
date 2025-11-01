-- CreateIndex
CREATE INDEX "athletes_lastName_firstName_idx" ON "athletes"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "athletes_gender_idx" ON "athletes"("gender");

-- CreateIndex
CREATE INDEX "athletes_category_idx" ON "athletes"("category");

-- CreateIndex
CREATE INDEX "athletes_club_idx" ON "athletes"("club");

-- CreateIndex
CREATE INDEX "competitions_startDate_idx" ON "competitions"("startDate");

-- CreateIndex
CREATE INDEX "competitions_status_idx" ON "competitions"("status");

-- CreateIndex
CREATE INDEX "competitions_isPublic_idx" ON "competitions"("isPublic");

-- CreateIndex
CREATE INDEX "competitions_createdById_idx" ON "competitions"("createdById");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
