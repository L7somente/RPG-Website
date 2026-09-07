import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CharacterSheet from "@/components/CharacterSheet";
import InventorySheet from "@/components/InventorySheet";

// Next.js 15+/16: `params` is a Promise and must be awaited before use.
export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const character = await prisma.character.findUnique({
    where: { id },
    include: { inventory: true },
  });

  if (!character || character.userId !== (session.user as any).id) {
    redirect("/characters");
  }

  return (
    <div className="space-y-6">
      <CharacterSheet character={character as any} />
      <InventorySheet characterId={character.id} initialItems={character.inventory as any} />
    </div>
  );
}
