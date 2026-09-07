import { AuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "./prisma";
import { resolveSiteRoleFromDiscord } from "./discord";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // Runs on every OAuth login. Links or creates the local User row.
    async signIn({ user, account, profile }) {
      if (account?.provider !== "discord" || !profile) return false;

      const discordId = (profile as any).id as string;
      const discordUsername =
        (profile as any).username ?? (profile as any).global_name ?? user.name ?? "Aventureiro";
      const discordAvatar = (user as any).image ?? null;
      // null = sync not configured or Discord unreachable -> don't touch existing role.
      const syncedRole = await resolveSiteRoleFromDiscord(discordId);

      // 1. Already linked -> just refresh cached fields (+ role, if synced).
      const byDiscordId = await prisma.user.findUnique({ where: { discordId } });
      if (byDiscordId) {
        const updated = await prisma.user.update({
          where: { id: byDiscordId.id },
          data: { discordAvatar, ...(syncedRole ? { role: syncedRole } : {}) },
        });
        (user as any).id = updated.id;
        (user as any).role = updated.role;
        (user as any).username = updated.username;
        return true;
      }

      // Legacy accounts must be linked by a trusted administrator after identity verification.
      // A matching username is never proof of ownership.
      // No match -> create a fresh account tied to this Discord user,
      // using whatever role their Discord roles resolve to (PLAYER if none).
      let username = discordUsername;
      let attempt = 0;
      while (await prisma.user.findUnique({ where: { username } })) {
        attempt += 1;
        username = `${discordUsername}${attempt}`;
      }
      const created = await prisma.user.create({
        data: { discordId, discordAvatar, username, role: syncedRole ?? "PLAYER" },
      });
      (user as any).id = created.id;
      (user as any).role = created.role;
      (user as any).username = created.username;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      const current = typeof token.id === "string"
        ? await prisma.user.findUnique({ where: { id: token.id }, select: { id: true, role: true, username: true } })
        : null;
      if (!current) {
        delete session.user;
      } else if (session.user) {
        Object.assign(session.user, current);
      }
      return session;
    },
  },
};
