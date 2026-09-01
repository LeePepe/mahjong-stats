import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoState } from "@/domain/demo";
import type { AuditEntry, MahjongState, Match, Player, Snapshot, SpecialEvent } from "@/domain/model";

function client(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

function ensure<T>(error: { message: string } | null, data: T | null): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export function databaseConfigured() { return client() !== null; }

export async function getState(): Promise<MahjongState> {
  const db = client();
  if (!db) return demoState;
  const [playersResult, matchesResult, resultsResult, eventsResult, snapshotsResult, auditResult] = await Promise.all([
    db.from("players").select("*").order("name"),
    db.from("matches").select("*").order("played_on", { ascending: false }),
    db.from("match_results").select("*"),
    db.from("special_events").select("*").order("occurred_on", { ascending: false }),
    db.from("snapshots").select("*").order("month", { ascending: false }),
    db.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100),
  ]);
  const players = ensure(playersResult.error, playersResult.data).map((row): Player => ({ id: row.id, name: row.name, aliases: row.aliases ?? [], active: row.active }));
  const resultRows = ensure(resultsResult.error, resultsResult.data);
  const matches = ensure(matchesResult.error, matchesResult.data).map((row): Match => ({
    id: row.id, playedOn: row.played_on, note: row.note ?? "", deletedAt: row.deleted_at,
    results: resultRows.filter((result) => result.match_id === row.id).map((result) => ({ playerId: result.player_id, score: Number(result.score) })),
  }));
  const specialEvents = ensure(eventsResult.error, eventsResult.data).map((row): SpecialEvent => ({ id: row.id, playerId: row.player_id, occurredOn: row.occurred_on, type: row.type, note: row.note ?? "", deletedAt: row.deleted_at }));
  const snapshots = ensure(snapshotsResult.error, snapshotsResult.data).map((row): Snapshot => ({ id: row.id, month: row.month, imageUrl: row.image_url, note: row.note ?? "" }));
  const audit = ensure(auditResult.error, auditResult.data).map((row): AuditEntry => ({ id: row.id, entityType: row.entity_type, entityId: row.entity_id, action: row.action, actor: row.actor, before: row.before_data, after: row.after_data, createdAt: row.created_at }));
  return { players, matches, specialEvents, snapshots, audit, demo: false };
}

async function audit(db: SupabaseClient, entry: Omit<AuditEntry, "id" | "createdAt">) {
  const { error } = await db.from("audit_log").insert({ entity_type: entry.entityType, entity_id: entry.entityId, action: entry.action, actor: entry.actor, before_data: entry.before, after_data: entry.after });
  if (error) throw new Error(error.message);
}

export type Mutation =
  | { type: "addPlayer"; actor: string; name: string }
  | { type: "addMatch"; actor: string; playedOn: string; note: string; results: { playerId: string; score: number }[] }
  | { type: "addTianhu"; actor: string; playerId: string; occurredOn: string; note: string }
  | { type: "deleteMatch" | "restoreMatch"; actor: string; id: string };

export async function mutate(input: Mutation) {
  const db = client();
  if (!db) throw new Error("数据库尚未配置");
  if (input.type === "addPlayer") {
    const inserted = await db.from("players").insert({ name: input.name.trim() }).select().single();
    const row = ensure(inserted.error, inserted.data);
    await audit(db, { entityType: "player", entityId: row.id, action: "create", actor: input.actor, before: null, after: row });
  } else if (input.type === "addMatch") {
    const inserted = await db.from("matches").insert({ played_on: input.playedOn, note: input.note }).select().single();
    const row = ensure(inserted.error, inserted.data);
    const results = input.results.map((result) => ({ match_id: row.id, player_id: result.playerId, score: result.score }));
    const resultInsert = await db.from("match_results").insert(results);
    if (resultInsert.error) throw new Error(resultInsert.error.message);
    await audit(db, { entityType: "match", entityId: row.id, action: "create", actor: input.actor, before: null, after: { ...row, results } });
  } else if (input.type === "addTianhu") {
    const inserted = await db.from("special_events").insert({ player_id: input.playerId, occurred_on: input.occurredOn, type: "tianhu", note: input.note }).select().single();
    const row = ensure(inserted.error, inserted.data);
    await audit(db, { entityType: "special_event", entityId: row.id, action: "create", actor: input.actor, before: null, after: row });
  } else {
    const previousResult = await db.from("matches").select("*").eq("id", input.id).single();
    const previous = ensure(previousResult.error, previousResult.data);
    const deletedAt = input.type === "deleteMatch" ? new Date().toISOString() : null;
    const updatedResult = await db.from("matches").update({ deleted_at: deletedAt }).eq("id", input.id).select().single();
    const updated = ensure(updatedResult.error, updatedResult.data);
    await audit(db, { entityType: "match", entityId: input.id, action: input.type === "deleteMatch" ? "delete" : "restore", actor: input.actor, before: previous, after: updated });
  }
}
