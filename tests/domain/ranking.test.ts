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
});
