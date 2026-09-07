const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  await prisma.globalXP.upsert({ where: { id: 1 }, update: {}, create: { id: 1, currentXP: 0, xpToNextLevel: 1000, currentLevel: 1 } });
  console.log("Initialized shared XP. No demo accounts were created.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
