// Central place for role checks so every route/page agrees on who can do what.
//
// PLAYER — owns characters, reads the dashboard, chats.
// DM     — everything a PLAYER can do, plus: create quests (go to pending
//          approval), schedule/organize tables, read any player's character
//          sheet, view + add inventory items on any character.
// ADMIN  — "master admin": everything a DM can do, quests they submit are
//          auto-approved, and they alone can approve/reject quests DMs submit.
//          Has access to both the DM panel and every player's panel.

export const ROLES = {
  PLAYER: "PLAYER",
  DM: "DM",
  ADMIN: "ADMIN",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export function roleOf(session: any): RoleType | undefined {
  return session?.user?.role;
}

export function isDM(session: any) {
  const r = roleOf(session);
  return r === ROLES.DM || r === ROLES.ADMIN;
}

export function isAdmin(session: any) {
  return roleOf(session) === ROLES.ADMIN;
}
