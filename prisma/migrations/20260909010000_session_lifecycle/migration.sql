ALTER TABLE "GameSession" ADD COLUMN "endedAt" TIMESTAMP(3),
ADD COLUMN "discordSyncError" TEXT,
ADD COLUMN "discordSyncedAt" TIMESTAMP(3),
ADD COLUMN "syncLockedUntil" TIMESTAMP(3);
