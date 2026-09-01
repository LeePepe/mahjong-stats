import type { MahjongState } from "./model";

const names = ["佳", "桂", "blue", "evol", "熊大", "李姐", "lin团", "oyo", "jingjing", "felix", "psq", "jean", "momo", "kexin", "db", "Tianpei"];
const players = names.map((name, index) => ({ id: `p${index + 1}`, name, aliases: [], active: true }));

export const demoState: MahjongState = {
  players,
  matches: [
    { id: "m1", playedOn: "2026-09-01", note: "示例牌局", results: [{ playerId: "p1", score: 38 }, { playerId: "p2", score: 14 }, { playerId: "p5", score: -52 }, { playerId: "p8", score: 0 }] },
    { id: "m2", playedOn: "2026-09-02", note: "示例牌局", results: [{ playerId: "p3", score: 26 }, { playerId: "p4", score: 12 }, { playerId: "p6", score: -8 }, { playerId: "p7", score: -30 }] },
    { id: "m3", playedOn: "2026-08-30", note: "历史示例", results: [{ playerId: "p2", score: 42 }, { playerId: "p8", score: 9 }, { playerId: "p9", score: 7 }, { playerId: "p5", score: -58 }] },
  ],
  specialEvents: [
    { id: "e1", playerId: "p1", occurredOn: "2026-08-28", type: "tianhu", note: "" },
    { id: "e2", playerId: "p1", occurredOn: "2026-08-06", type: "tianhu", note: "" },
    { id: "e3", playerId: "p2", occurredOn: "2026-08-30", type: "tianhu", note: "" },
    { id: "e4", playerId: "p3", occurredOn: "2026-06-28", type: "tianhu", note: "" },
    { id: "e5", playerId: "p4", occurredOn: "2026-09-02", type: "tianhu", note: "" },
  ],
  snapshots: [],
  audit: [{ id: "a1", entityType: "match", entityId: "m1", action: "create", actor: "示例", before: null, after: { note: "示例牌局" }, createdAt: "2026-09-01T09:43:00Z" }],
  demo: true,
};
