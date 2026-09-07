import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isDM, isAdmin } from "@/lib/roles";
import DMPanelHeader from "@/components/DMPanelHeader";
import DMQuestPanel from "@/components/DMQuestPanel";
import TableOrganizer from "@/components/TableOrganizer";
import PlayerCharacterList from "@/components/PlayerCharacterList";
import ItemForge from "@/components/ItemForge";

export default async function DMDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!isDM(session)) redirect("/");

  return (
    <div className="space-y-6">
      <DMPanelHeader showAdmin={isAdmin(session)} />
      <DMQuestPanel />
      <TableOrganizer />
      <ItemForge />
      <PlayerCharacterList />
    </div>
  );
}
