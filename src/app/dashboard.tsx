"use client";

import { FormEvent, useMemo, useState } from "react";
import type { MahjongState } from "@/domain/model";
import type { Mutation } from "@/domain/mutation";
import { availableMonths, monthlyRanking, singleGameTop, tianhuRanking } from "@/domain/ranking";
import { commitMutation, type GithubSession } from "@/data-access/github-store";

type Tab = "board" | "record" | "history";
const currentMonth = new Date().toISOString().slice(0, 7);
const score = (value: number) => `${value > 0 ? "+" : ""}${value.toLocaleString("zh-CN")}`;
const shortDate = (value: string) => new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(new Date(`${value}T00:00:00`));

export default function Dashboard({ session, initialState }: { session: GithubSession; initialState: MahjongState }) {
  const [state, setState] = useState<MahjongState>(initialState);
  const [tab, setTab] = useState<Tab>("board");
  const [month, setMonth] = useState(currentMonth);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [actor, setActor] = useState("");

  async function save(payload: Record<string, unknown>) {
    if (!actor.trim()) { setMessage("先填写你的昵称"); return; }
    setBusy(true); setMessage(""); window.localStorage.setItem("mahjong-actor", actor.trim());
    try { const next = await commitMutation(session, { ...payload, actor: actor.trim() } as Mutation); setState(next); setMessage("已提交到 GitHub，并写入编辑历史"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "保存失败"); } finally { setBusy(false); }
  }

  const months = useMemo(() => availableMonths(state), [state]);
  const selectedMonth = months.includes(month) ? month : (months[0] ?? month);
  const ranking = useMemo(() => monthlyRanking(state, selectedMonth), [state, selectedMonth]);
  const wins = useMemo(() => singleGameTop(state, selectedMonth, "win"), [state, selectedMonth]);
  const losses = useMemo(() => singleGameTop(state, selectedMonth, "loss"), [state, selectedMonth]);
  const tianhu = useMemo(() => tianhuRanking(state), [state]);

  return <main className="app-shell">
    <header className="hero"><div><p className="eyebrow">极三家 · 牌局档案</p><h1>麻将统计</h1></div><div className="live-pill"><span />{state.demo ? "演示数据" : "实时同步"}</div></header>
    <nav className="tabs" aria-label="主要功能">{([['board', '排行榜'], ['record', '记一局'], ['history', '编辑历史']] as [Tab, string][]).map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</nav>
    {message && <div className="notice" role="status">{message}</div>}{!session.token && <div className="demo-banner">数据仓库已连接；写入 Token 配置后即可共同编辑。</div>}
    {tab === "board" && <>
      <section className="month-strip"><div><span className="month-number">{Number(selectedMonth.slice(5))}</span><span>月</span><small>{selectedMonth.slice(0, 4)} 赛季</small></div><select value={selectedMonth} onChange={(event) => setMonth(event.target.value)} aria-label="选择月份">{months.map((value) => <option key={value} value={value}>{value}</option>)}</select></section>
      <section className="panel ranking-panel"><div className="section-heading"><div><p className="eyebrow">MONTHLY BOARD</p><h2>月度排行</h2></div><span>{ranking.length} 位牌友</span></div>{ranking.length ? <div className="ranking-list">{ranking.map((row, index) => <div className="ranking-row" key={row.playerId}><div className={`rank rank-${Math.min(index + 1, 4)}`}>{index + 1}</div><div className="player"><strong>{row.name}</strong><small>{row.games} 局 · {row.tier} 档</small></div><strong className={row.score >= 0 ? "positive" : "negative"}>{score(row.score)}</strong></div>)}</div> : <Empty text="这个月还没有牌局" />}</section>
      <div className="top-grid"><TopCard title="单局赢家" icon="↗" rows={wins} /><TopCard title="单局输家" icon="↘" rows={losses} /></div>
      <section className="panel"><div className="section-heading"><div><p className="eyebrow">SPECIAL HANDS</p><h2>天胡排行榜</h2></div><span>累计</span></div><div className="tianhu-list">{tianhu.map((row, index) => <div className="tianhu-row" key={row.playerId}><span>{index + 1}</span><strong>{row.name}</strong><div>{row.dates.map(shortDate).join("、")}</div><b>{row.count}<small> 次</small></b></div>)}</div></section>
    </>}
    {tab === "record" && <RecordPanel state={state} actor={actor} setActor={setActor} busy={busy} save={save} />}
    {tab === "history" && <HistoryPanel state={state} actor={actor} setActor={setActor} busy={busy} save={save} />}
    <footer>牌桌上的输赢会过去，记录会留下。</footer>
  </main>;
}

function TopCard({ title, icon, rows }: { title: string; icon: string; rows: { matchId: string; name: string; score: number; date: string }[] }) { return <section className="panel top-card"><div className="section-heading"><h3>{title}</h3><i>{icon}</i></div>{rows.length ? rows.map((row, index) => <div className="top-row" key={`${row.matchId}-${row.name}`}><span>{index + 1}</span><div><strong>{row.name}</strong><small>{shortDate(row.date)}</small></div><b className={row.score > 0 ? "positive" : "negative"}>{score(row.score)}</b></div>) : <Empty text="暂无记录" />}</section>; }
function Empty({ text }: { text: string }) { return <p className="empty">{text}</p>; }
function ActorField({ actor, setActor }: { actor: string; setActor: (value: string) => void }) { return <label><span>你的昵称（写入历史）</span><input value={actor} onChange={(event) => setActor(event.target.value)} maxLength={30} placeholder="例如：Tianpei" /></label>; }

function RecordPanel({ state, actor, setActor, busy, save }: { state: MahjongState; actor: string; setActor: (value: string) => void; busy: boolean; save: (payload: Record<string, unknown>) => Promise<void> }) {
  const players = state.players.filter((player) => player.active); const defaults = players.slice(0, 4);
  const [playedOn, setPlayedOn] = useState(new Date().toISOString().slice(0, 10)); const [selected, setSelected] = useState(defaults.map((player) => player.id)); const [scores, setScores] = useState([0, 0, 0, 0]); const [newPlayer, setNewPlayer] = useState(""); const [tianhuPlayer, setTianhuPlayer] = useState(players[0]?.id ?? "");
  async function submitMatch(event: FormEvent) { event.preventDefault(); await save({ type: "addMatch", playedOn, note: "", results: selected.map((playerId, index) => ({ playerId, score: scores[index] })) }); }
  return <div className="form-stack"><section className="panel form-panel"><div className="section-heading"><div><p className="eyebrow">NEW MATCH</p><h2>记一局</h2></div><b className={scores.reduce((a, b) => a + b, 0) === 0 ? "positive" : "negative"}>合计 {score(scores.reduce((a, b) => a + b, 0))}</b></div><form onSubmit={submitMatch}><ActorField actor={actor} setActor={setActor} /><label><span>日期</span><input type="date" value={playedOn} onChange={(event) => setPlayedOn(event.target.value)} required /></label><div className="score-inputs">{[0, 1, 2, 3].map((index) => <div key={index}><select value={selected[index] ?? ""} onChange={(event) => setSelected((old) => old.map((value, i) => i === index ? event.target.value : value))} required><option value="">选择玩家</option>{players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select><input aria-label={`玩家 ${index + 1} 得分`} type="number" step="0.5" value={scores[index]} onChange={(event) => setScores((old) => old.map((value, i) => i === index ? Number(event.target.value) : value))} /></div>)}</div><button className="primary" disabled={busy || new Set(selected).size !== 4}>{busy ? "保存中…" : "保存牌局"}</button></form></section>
    <section className="panel form-panel"><h3>记录天胡</h3><div className="inline-form"><select value={tianhuPlayer} onChange={(event) => setTianhuPlayer(event.target.value)}>{players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select><button disabled={busy || !tianhuPlayer} onClick={() => save({ type: "addTianhu", playerId: tianhuPlayer, occurredOn: playedOn, note: "" })}>+ 天胡</button></div></section>
    <section className="panel form-panel"><h3>添加牌友</h3><div className="inline-form"><input value={newPlayer} onChange={(event) => setNewPlayer(event.target.value)} placeholder="新牌友昵称" /><button disabled={busy || !newPlayer.trim()} onClick={async () => { await save({ type: "addPlayer", name: newPlayer }); setNewPlayer(""); }}>添加</button></div></section></div>;
}

function HistoryPanel({ state, actor, setActor, busy, save }: { state: MahjongState; actor: string; setActor: (value: string) => void; busy: boolean; save: (payload: Record<string, unknown>) => Promise<void> }) { return <div className="form-stack"><section className="panel form-panel"><ActorField actor={actor} setActor={setActor} /><div className="section-heading"><div><p className="eyebrow">AUDIT TRAIL</p><h2>编辑历史</h2></div><span>最近 100 条</span></div><div className="history-list">{state.audit.map((entry) => <article key={entry.id}><div className="history-dot"/><div><strong>{entry.actor}</strong><p>{actionLabel(entry.action)} · {entityLabel(entry.entityType)}</p><time>{new Date(entry.createdAt).toLocaleString("zh-CN")}</time></div></article>)}</div></section>
    <section className="panel"><div className="section-heading"><h3>已删除牌局</h3><span>可恢复</span></div>{state.matches.filter((match) => match.deletedAt).map((match) => <div className="deleted-row" key={match.id}><span>{match.playedOn} · {match.note || "牌局"}</span><button disabled={busy} onClick={() => save({ type: "restoreMatch", id: match.id })}>恢复</button></div>)}{!state.matches.some((match) => match.deletedAt) && <Empty text="没有已删除记录" />}</section>
    <section className="panel"><div className="section-heading"><h3>近期牌局</h3><span>软删除</span></div>{state.matches.filter((match) => !match.deletedAt).slice(0, 12).map((match) => <div className="deleted-row" key={match.id}><span>{match.playedOn} · {match.note || `${match.results.length} 人牌局`}</span><button className="danger" disabled={busy} onClick={() => save({ type: "deleteMatch", id: match.id })}>删除</button></div>)}</section></div>; }
function actionLabel(action: string) { return ({ create: "新增", update: "修改", delete: "删除", restore: "恢复" } as Record<string, string>)[action] ?? action; }
function entityLabel(entity: string) { return ({ player: "牌友", match: "牌局", special_event: "天胡", snapshot: "历史截图" } as Record<string, string>)[entity] ?? entity; }
