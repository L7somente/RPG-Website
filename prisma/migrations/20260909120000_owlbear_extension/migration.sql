ALTER TABLE "GameSession" ADD COLUMN "owlbearRoomUrl" TEXT, ADD COLUMN "owlbearRoomId" TEXT;
CREATE TABLE "OwlbearAccess" (
  "tokenHash" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "characterId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "OwlbearAccess_userId_sessionId_idx" ON "OwlbearAccess"("userId", "sessionId");
CREATE INDEX "OwlbearAccess_expiresAt_idx" ON "OwlbearAccess"("expiresAt");
