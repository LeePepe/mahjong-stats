# 麻将统计

手机优先的群内麻将战绩网页：月度排行、单局输赢 Top 3、天胡统计、共同录入和编辑历史。

## 本地运行

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

访问 `http://localhost:3000/?key=你的访问码`。没有正确 Query 参数时返回 404。

未配置 Supabase 时，开发环境可使用 `?key=demo` 查看只读示例。

## 数据库

1. 创建 Supabase project。
2. 依次执行 `supabase/migrations/001_initial_schema.sql` 和 `supabase/seed.sql`。
3. 把 Supabase URL、service-role key 和一个长随机访问码配置为部署平台的环境变量。

所有表均启用 RLS 且没有匿名策略。浏览器只能通过受 Query key 保护的服务端 API 访问数据。

## 验证

```bash
pnpm context:audit
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

分层规则从 `tech-context.md` 递归展开；顶层入口见 `AGENTS.md`。
