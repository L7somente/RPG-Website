import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import DMPanelAccessHeading from "@/components/DMPanelAccessHeading";
import QuestOversight from "@/components/QuestOversight";
import DMQuestPanel from "@/components/DMQuestPanel";
import TableOrganizer from "@/components/TableOrganizer";
import PlayerCharacterList from "@/components/PlayerCharacterList";
import ItemForge from "@/components/ItemForge";

// Master admins see everything a DM sees (quest submission, tables, player
// characters) plus the approval queue that gates every DM-submitted quest.
export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!isAdmin(session)) redirect("/");

  return (
    <div className="space-y-6">
      <AdminPanelHeader />

      <QuestOversight />

      <hr className="border-brass/20" />

      <DMPanelAccessHeading />
      <DMQuestPanel />
      <TableOrganizer />
      <ItemForge />
      <PlayerCharacterList />
    </div>
  );
}
