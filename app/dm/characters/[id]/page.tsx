import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDM } from "@/lib/roles";
import DMCharacterView from "@/components/DMCharacterView";
import InventorySheet from "@/components/InventorySheet";
import BackToDMPanelLink from "@/components/BackToDMPanelLink";

// Next.js 15+/16: `params` is a Promise and must be awaited before use.
export default async function DMCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!isDM(session)) redirect("/");

  const character = await prisma.character.findUnique({
    where: { id },
    include: { inventory: true, user: { select: { username: true } } },
  });
  if (!character) redirect("/dm");

  return (
    <div className="space-y-6">
      <BackToDMPanelLink />
      <DMCharacterView character={character as any} ownerUsername={character.user.username} />
      <InventorySheet characterId={character.id} initialItems={character.inventory as any} dmMode />
    </div>
  );
}
