import type { AuditEntry, MahjongState, Match, Player, SpecialEvent } from "./model";

export type Mutation =
  | { type: "addPlayer"; actor: string; name: string }
  | { type: "addMatch"; actor: string; playedOn: string; note: string; results: { playerId: string; score: number }[] }
  | { type: "addTianhu"; actor: string; playerId: string; occurredOn: string; note: string }
  | { type: "deleteMatch" | "restoreMatch"; actor: string; id: string };

type MutationClock = { id: () => string; now: () => string };
const defaultClock: MutationClock = { id: () => crypto.randomUUID(), now: () => new Date().toISOString() };

export function applyMutation(source: MahjongState, input: Mutation, clock = defaultClock): MahjongState {
  const state = structuredClone(source); const actor = input.actor.trim();
  if (!actor || actor.length > 30) throw new Error("请填写 1–30 字的昵称");
  let entityType: AuditEntry["entityType"]; let entityId: string; let action: AuditEntry["action"] = "create"; let before: unknown = null; let after: unknown;
  if (input.type === "addPlayer") {
    const name = input.name.trim(); if (!name || name.length > 30) throw new Error("牌友昵称应为 1–30 字");
    if (state.players.some((player) => player.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error("这位牌友已经存在");
    const player: Player = { id: clock.id(), name, aliases: [], active: true }; state.players.push(player); entityType = "player"; entityId = player.id; after = player;
  } else if (input.type === "addMatch") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.playedOn)) throw new Error("牌局日期无效");
    if (input.results.length !== 4 || new Set(input.results.map((row) => row.playerId)).size !== 4) throw new Error("一局必须选择四位不同的玩家");
    if (input.results.some((row) => !Number.isFinite(row.score) || !state.players.some((player) => player.id === row.playerId))) throw new Error("牌局得分或玩家无效");
    const match: Match = { id: clock.id(), playedOn: input.playedOn, note: input.note.slice(0, 200), results: input.results }; state.matches.unshift(match); entityType = "match"; entityId = match.id; after = match;
  } else if (input.type === "addTianhu") {
    if (!state.players.some((player) => player.id === input.playerId)) throw new Error("天胡玩家不存在");
    const event: SpecialEvent = { id: clock.id(), playerId: input.playerId, occurredOn: input.occurredOn, type: "tianhu", note: input.note.slice(0, 200) }; state.specialEvents.unshift(event); entityType = "special_event"; entityId = event.id; after = event;
  } else {
    const match = state.matches.find((item) => item.id === input.id); if (!match) throw new Error("牌局不存在");
    before = structuredClone(match); match.deletedAt = input.type === "deleteMatch" ? clock.now() : null; entityType = "match"; entityId = match.id; action = input.type === "deleteMatch" ? "delete" : "restore"; after = match;
  }
  state.audit.unshift({ id: clock.id(), entityType, entityId, action, actor, before, after, createdAt: clock.now() }); state.demo = false;
  return state;
}
