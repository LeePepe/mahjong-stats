import type { MahjongState, RankingRow, TianhuRow } from "./model";

export const monthOf = (value: string) => value.slice(0, 7);

function tierFor(score: number): RankingRow["tier"] {
  if (score >= 50) return "A";
  if (score >= 0) return "B";
  if (score >= -50) return "C";
  return "D";
}

export function monthlyRanking(state: MahjongState, month: string): RankingRow[] {
  const totals = new Map<string, { score: number; games: number }>();
  state.matches.filter((match) => !match.deletedAt && monthOf(match.playedOn) === month).forEach((match) => {
    match.results.forEach((result) => {
      const current = totals.get(result.playerId) ?? { score: 0, games: 0 };
      totals.set(result.playerId, { score: current.score + result.score, games: current.games + 1 });
    });
  });
  return [...totals.entries()].map(([playerId, total]) => ({
    playerId,
    name: state.players.find((player) => player.id === playerId)?.name ?? "未知玩家",
    ...total,
    tier: tierFor(total.score),
  })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "zh-CN"));
}

export function singleGameTop(state: MahjongState, month: string, direction: "win" | "loss") {
  return state.matches.filter((match) => !match.deletedAt && monthOf(match.playedOn) === month).flatMap((match) =>
    match.results.map((result) => ({
      matchId: match.id,
      date: match.playedOn,
      playerId: result.playerId,
      name: state.players.find((player) => player.id === result.playerId)?.name ?? "未知玩家",
      score: result.score,
    })),
  ).filter((row) => direction === "win" ? row.score > 0 : row.score < 0)
    .sort((a, b) => direction === "win" ? b.score - a.score : a.score - b.score).slice(0, 3);
}

export function tianhuRanking(state: MahjongState): TianhuRow[] {
  const grouped = new Map<string, string[]>();
  state.specialEvents.filter((event) => !event.deletedAt && event.type === "tianhu").forEach((event) => {
    grouped.set(event.playerId, [...(grouped.get(event.playerId) ?? []), event.occurredOn]);
  });
  return [...grouped.entries()].map(([playerId, dates]) => ({
    playerId,
    name: state.players.find((player) => player.id === playerId)?.name ?? "未知玩家",
    count: dates.length,
    dates: dates.sort().reverse(),
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

export function availableMonths(state: MahjongState) {
  return [...new Set([
    ...state.matches.filter((match) => !match.deletedAt).map((match) => monthOf(match.playedOn)),
    ...state.snapshots.map((snapshot) => snapshot.month),
  ])].sort().reverse();
}
