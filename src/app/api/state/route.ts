import { NextRequest, NextResponse } from "next/server";
import { hasAccess } from "@/server/access";
import { getState } from "@/server/store";

export async function GET(request: NextRequest) {
  if (!hasAccess(request.nextUrl.searchParams.get("key"))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try { return NextResponse.json(await getState()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "读取失败" }, { status: 500 }); }
}
