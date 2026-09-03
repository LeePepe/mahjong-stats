import { describe, expect, it } from "vitest";
import { demoState } from "../../src/domain/demo";
import { availableMonths, monthlyRanking, singleGameTop, tianhuRanking } from "../../src/domain/ranking";

describe("rankings", () => {
  it("aggregates monthly scores and sorts descending", () => {
    const rows = monthlyRanking(demoState, "2026-09");
    expect(rows[0]).toMatchObject({ name: "佳", score: 38 });
    expect(rows.at(-1)).toMatchObject({ name: "熊大", score: -52 });
  });
  it("returns single-game wins and losses", () => {
    expect(singleGameTop(demoState, "2026-09", "win")[0].score).toBe(38);
    expect(singleGameTop(demoState, "2026-09", "loss")[0]).toMatchObject({ name: "熊大", score: -52 });
  });
  it("groups tianhu events and lists available months", () => {
    expect(tianhuRanking(demoState)[0]).toMatchObject({ name: "佳", count: 2 });
    expect(availableMonths(demoState)).toEqual(["2026-09", "2026-08"]);
  });
  it("uses published historical standings without inventing matches", () => {
    const state = { ...demoState, monthlyStandings: [{ month: "2026-07", source: "公告", incomplete: true, entries: [{ rank: 2, name: "瓜瓜乐", score: 142.5, tier: "A" as const }] }] };
    expect(monthlyRanking(state, "2026-07")[0]).toMatchObject({ publishedRank: 2, name: "瓜瓜乐", score: 142.5, historical: true });
    expect(availableMonths(state)).toContain("2026-07");
  });
  it("adds post-baseline tianhu events to the reported count", () => {
    const state = { ...demoState, tianhuBaselines: [{ playerId: "p1", reportedCount: 8, knownDates: ["5.28"], asOf: "2026-09-01", source: "公告" }] };
    expect(tianhuRanking(state).find((row) => row.playerId === "p1")?.count).toBe(8);
    state.specialEvents = [...state.specialEvents, { id: "new", playerId: "p1", occurredOn: "2026-09-03", type: "tianhu", note: "" }];
    expect(tianhuRanking(state).find((row) => row.playerId === "p1")?.count).toBe(9);
  });
  it("sorts directly synced monthly scores", () => {
    const state = { ...demoState, matches: [], monthlyScores: [{ id: "a", month: "2026-09", name: "甲", score: -2, updatedAt: "", updatedBy: "" }, { id: "b", month: "2026-09", name: "乙", score: 9, updatedAt: "", updatedBy: "" }] };
    expect(monthlyRanking(state, "2026-09").map((row) => [row.name, row.tier])).toEqual([["乙", "S"], ["甲", "F"]]);
  });
});
