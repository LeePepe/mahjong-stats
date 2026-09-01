import { Suspense } from "react";
import GithubApp from "./github-app";

export default function Home() {
  return <Suspense fallback={<main className="loading">正在摆牌桌…</main>}><GithubApp /></Suspense>;
}
