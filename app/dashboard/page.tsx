import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDM, isAdmin } from "@/lib/roles";
import DashboardHeader from "@/components/DashboardHeader";
import QuestBoard from "@/components/QuestBoard";
import NoticeBoard from "@/components/NoticeBoard";
import SessionSchedule from "@/components/SessionSchedule";
import MissionLog from "@/components/MissionLog";
import DiscordChat from "@/components/DiscordChat";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <DashboardHeader showAdmin={isAdmin(session)} showDM={isDM(session)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuestBoard />
        <NoticeBoard />
        <SessionSchedule />
        <MissionLog />
      </div>

      <DiscordChat />
    </div>
  );
}
