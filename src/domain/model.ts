export type Player = { id: string; name: string; aliases: string[]; active: boolean };
export type MatchResult = { playerId: string; score: number };
export type Match = { id: string; playedOn: string; note: string; results: MatchResult[]; deletedAt?: string | null };
export type SpecialEvent = { id: string; playerId: string; occurredOn: string; type: "tianhu"; note: string; deletedAt?: string | null };
export type Snapshot = { id: string; month: string; imageUrl: string; note: string };
export type MonthlyStanding = {
  month: string;
  source: string;
  incomplete: boolean;
  entries: { rank: number; name: string; score: number; tier: "A" | "B" | "C" | "D" }[];
};
export type TianhuBaseline = { playerId: string; reportedCount: number; knownDates: string[]; asOf: string; source: string };
export type MonthlyScore = { id: string; month: string; name: string; score: number; updatedAt: string; updatedBy: string };
export type AuditEntry = {
  id: string;
  entityType: "player" | "match" | "special_event" | "snapshot" | "monthly_score";
  entityId: string;
  action: "create" | "update" | "delete" | "restore";
  actor: string;
  before: unknown;
  after: unknown;
  createdAt: string;
};
export type MahjongState = { players: Player[]; matches: Match[]; specialEvents: SpecialEvent[]; snapshots: Snapshot[]; audit: AuditEntry[]; monthlyStandings?: MonthlyStanding[]; tianhuBaselines?: TianhuBaseline[]; monthlyScores?: MonthlyScore[]; demo: boolean };
export type RankingRow = { playerId: string; name: string; score: number; games: number; tier: "A" | "B" | "C" | "D"; publishedRank?: number; historical?: boolean };
export type TianhuRow = { playerId: string; name: string; count: number; dates: string[] };
