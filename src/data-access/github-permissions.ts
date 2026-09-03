type FetchLike = typeof fetch;

export async function verifyGithubWritePermission(token: string, fetcher: FetchLike = fetch) {
  const response = await fetcher("https://api.github.com/repos/LeePepe/mahjong-stats-data/contents/data/state.json", {
    method: "PUT",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
    body: "{}",
  });
  if (response.status === 422) return;
  const body = await response.json().catch(() => ({})) as { message?: string };
  if (response.status === 403) throw new Error("Token 没有 mahjong-stats-data 的 Contents: Read and write 权限");
  throw new Error(body.message ?? `无法验证 Token 写权限（HTTP ${response.status}）`);
}
