import { describe, expect, it } from "vitest";
import { demoState } from "../../src/domain/demo";
import { applyMutation } from "../../src/domain/mutation";

const clock = { id: (() => { let value = 0; return () => `id-${++value}`; })(), now: () => "2026-09-01T10:00:00Z" };
describe("mutations", () => {
  it("adds a match and audit entry", () => {
    const results = demoState.players.slice(0, 4).map((player, index) => ({ playerId: player.id, score: [30, 10, -15, -25][index] }));
    const next = applyMutation(demoState, { type: "addMatch", actor: "测试", playedOn: "2026-09-01", note: "", results }, clock);
    expect(next.matches).toHaveLength(demoState.matches.length + 1); expect(next.audit[0]).toMatchObject({ actor: "测试", action: "create", entityType: "match" });
  });
  it("soft-deletes and restores a match", () => {
    const removed = applyMutation(demoState, { type: "deleteMatch", actor: "测试", id: "m1" }, clock);
    expect(removed.matches.find((match) => match.id === "m1")?.deletedAt).toBeTruthy();
    const restored = applyMutation(removed, { type: "restoreMatch", actor: "测试", id: "m1" }, clock);
    expect(restored.matches.find((match) => match.id === "m1")?.deletedAt).toBeNull();
  });
  it("creates and freely renames a synced monthly score", () => {
    const created = applyMutation(demoState, { type: "upsertMonthlyScore", actor: "本人", month: "2026-09", name: "旧昵称", score: 12 }, clock);
    const entry = created.monthlyScores![0];
    const renamed = applyMutation(created, { type: "upsertMonthlyScore", actor: "本人", id: entry.id, month: "2026-09", name: "新昵称", score: 18.5 }, clock);
    expect(renamed.monthlyScores![0]).toMatchObject({ name: "新昵称", score: 18.5 });
    expect(renamed.audit[0]).toMatchObject({ entityType: "monthly_score", action: "update" });
  });
});
