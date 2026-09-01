"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { MahjongState } from "@/domain/model";
import { loadState, openSession, type GithubSession } from "@/data-access/github-store";
import Dashboard from "./dashboard";

type Ready = { session: GithubSession; state: MahjongState };

export default function GithubApp() {
  const key = useSearchParams().get("key") ?? "";
  const [ready, setReady] = useState<Ready | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!key) return;
    let active = true;
    openSession(key).then(async (session) => ({ session, state: await loadState(session) }))
      .then((value) => { if (active) setReady(value); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "访问失败"); });
    return () => { active = false; };
  }, [key]);
  if (!key || error) return <main className="locked-shell"><div className="locked-mark">🀄</div><p className="eyebrow">私人牌局</p><h1>这里没有公开内容</h1><p>{error || "请使用群里分享的完整链接访问。"}</p></main>;
  if (!ready) return <main className="loading">正在摆牌桌…</main>;
  return <Dashboard session={ready.session} initialState={ready.state} />;
}
