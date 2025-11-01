-- Update existing heats with maxLanes = 8 to maxLanes = 20
UPDATE "heats" SET "maxLanes" = 20 WHERE "maxLanes" = 8;