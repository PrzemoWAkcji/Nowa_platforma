-- CreateIndex
CREATE INDEX "combined_event_results_combinedEventId_idx" ON "combined_event_results"("combinedEventId");

-- CreateIndex
CREATE INDEX "combined_event_results_combinedEventId_dayOrder_idx" ON "combined_event_results"("combinedEventId", "dayOrder");

-- CreateIndex
CREATE INDEX "combined_event_results_discipline_idx" ON "combined_event_results"("discipline");

-- CreateIndex
CREATE INDEX "combined_events_competitionId_idx" ON "combined_events"("competitionId");

-- CreateIndex
CREATE INDEX "combined_events_competitionId_eventType_idx" ON "combined_events"("competitionId", "eventType");

-- CreateIndex
CREATE INDEX "combined_events_competitionId_eventType_isComplete_idx" ON "combined_events"("competitionId", "eventType", "isComplete");

-- CreateIndex
CREATE INDEX "combined_events_totalPoints_idx" ON "combined_events"("totalPoints");
