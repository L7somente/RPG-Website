-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "discordEventId" TEXT,
ADD COLUMN     "discordVoiceChannelId" TEXT,
ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 240;

-- AlterTable
ALTER TABLE "Quest" ADD COLUMN     "discordThreadId" TEXT;
