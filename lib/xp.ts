import { Prisma } from "@prisma/client";
import { serializable } from "./transaction";
import { xpAmount } from "./validation";
import { broadcast } from "./realtime";
export async function awardXPInTransaction(tx: Prisma.TransactionClient, amount: number) {
  xpAmount.parse(amount);
  const current = await tx.globalXP.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  let { currentXP, currentLevel, xpToNextLevel } = current;
  if (xpToNextLevel <= 0) throw new Error("Invalid XP threshold");
  currentXP += amount;
  while (currentXP >= xpToNextLevel) {
    currentXP -= xpToNextLevel;
    currentLevel += 1;
    xpToNextLevel = Math.round(xpToNextLevel * 1.25);
  }
  return tx.globalXP.update({ where: { id: 1 }, data: { currentXP, currentLevel, xpToNextLevel } });
}
export async function awardXP(amount: number) {
  const updated = await serializable((tx) => awardXPInTransaction(tx, amount));
  await broadcast("xp", updated);
  return updated;
}
