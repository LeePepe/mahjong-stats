import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasAccess } from "@/server/access";
import { databaseConfigured, mutate } from "@/server/store";

const actor = z.string().trim().min(1).max(30);
const mutationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("addPlayer"), actor, name: z.string().trim().min(1).max(30) }),
  z.object({ type: z.literal("addMatch"), actor, playedOn: z.iso.date(), note: z.string().max(200), results: z.array(z.object({ playerId: z.string().uuid(), score: z.number().finite() })).length(4).refine((rows) => new Set(rows.map((row) => row.playerId)).size === 4, "四位玩家不能重复") }),
  z.object({ type: z.literal("addTianhu"), actor, playerId: z.string().uuid(), occurredOn: z.iso.date(), note: z.string().max(200) }),
  z.object({ type: z.enum(["deleteMatch", "restoreMatch"]), actor, id: z.string().uuid() }),
]);

export async function POST(request: NextRequest) {
  if (!hasAccess(request.nextUrl.searchParams.get("key"))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!databaseConfigured()) return NextResponse.json({ error: "当前为只读演示；请先配置 Supabase。" }, { status: 503 });
  const parsed = mutationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "输入有误" }, { status: 400 });
  try { await mutate(parsed.data); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 500 }); }
}
