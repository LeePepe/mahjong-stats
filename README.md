# 麻将统计

手机优先的群内麻将战绩网页：月度排行、单局输赢 Top 3、天胡统计、共同录入和编辑历史。

## 本地运行

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

访问 `http://localhost:3000/?key=你的访问码`。没有正确 Query 参数时不渲染牌局数据。

## GitHub 数据写入

数据位于公开的 `LeePepe/mahjong-stats-data` 仓库。每次网页修改都会更新 `data/state.json` 并生成 commit。

创建一个仅授权该数据仓库 `Contents: Read and write` 的 fine-grained personal access token，然后运行：

```bash
MAHJONG_ACCESS_KEY='至少16位群访问码' \
GITHUB_DATA_TOKEN='github_pat_...' \
pnpm access:encrypt
```

这会把加密后的 Token 和访问码哈希写入 `public/access.json`；明文 Token 与访问码不会进入 Git。持有完整 Query 链接的人可以在浏览器中解密 Token，因此该 Token 不能授权源码仓库或其他仓库。

## 部署

推送 `main` 后，GitHub Actions 自动静态导出并发布到 GitHub Pages。

## 验证

```bash
pnpm context:audit
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

分层规则从 `tech-context.md` 递归展开；顶层入口见 `AGENTS.md`。
