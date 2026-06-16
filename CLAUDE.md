# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

化学知识问答学习站（chem-qa）：面向全国高中生的化学知识点浏览 + AI 辅导问答。npm workspaces 单仓，前端 React + 后端 NestJS + MySQL。

## 常用命令

```bash
# 一键起完整开发环境（检查环境→装依赖→起 MySQL→等就绪→导入知识点→起前后端）
./run.sh                 # --no-import 跳过导入 / --no-db 跳过 MySQL

# 分步
npm run db:up            # 起 MySQL（docker-compose，宿主端口 3307）
npm run import-content   # 导知识点（会 TRUNCATE 并重建 knowledge_nodes 表）
npm run dev              # 同时起 API(3001) + Web(5173)，预钩子先释放 3001 端口
npm run dev:api          # 仅后端  npm run dev:web 仅前端
npm run stop             # 杀掉占用 3001/5173 的旧进程
npm run build            # 构建 api + web
npm run db:down          # 停 MySQL 容器

# 种子脚本（直接用 ts-node 跑，未挂到 npm scripts）
npx ts-node --project scripts/tsconfig.json scripts/seed-exams.ts
npx ts-node --project scripts/tsconfig.json scripts/seed-accounts.ts
npx ts-node --esm --project scripts/tsconfig.json scripts/seed-training.ts
```

无单测套件（api/web 均无 test 脚本）。验证改动靠跑 `npm run dev` + 浏览器实测；后端自检 `http://localhost:3001/api/llm/health`。

## 项目内 Skills

- `skills/deploy-chem-qa-single-image/SKILL.md`：复用本项目单镜像 Docker + SQLite + 阿里云 ACR + 服务器 Docker + nginx-ui 发布流程时优先读取，包含部署步骤、验证命令和踩坑点。

## 架构要点（需跨文件阅读才能理清的部分）

### 仓库结构
- `apps/api/` — NestJS 后端，按领域分模块（auth/chat/llm/knowledge/progress/favorites/training/exam/study-plan/users/mail）。每模块 `*.module/controller/service.ts`，实体集中在 `apps/api/src/entities/`。
- `apps/web/` — React 19 + Vite + react-router v7。`pages/` 页面、`components/` 组件、`context/`（Auth/Theme）、`lib/`（api 客户端、roles、membership、i18n、各种 fallback/seed 数据）。
- `content/chemistry/` — 知识点内容源：`meta.json` 定义三级树（module→chapter→topic）+ 各 topic 的 Markdown。
- `scripts/` — `import-content.ts` 及 seed 脚本。
- `openspec/changes/` — 变更提案（见下「OpenSpec 工作流」）。

### 配置与环境变量
- **唯一配置源是项目根目录 `.env`**（从 `.env.example` 复制）。后端通过 `config/load-env.ts` + `ConfigModule` 按多候选路径回溯到根 `.env`；`import-content`/seed 脚本各自 `dotenv` 加载根 `.env`。
- 改 `.env` 后**必须重启** `npm run dev` 才生效。
- 前端经 Vite 代理 `/api` → `localhost:3001`，所有请求走 `apps/web/src/lib/api.ts` 的 `api()`（`credentials: include`，JWT 在 httpOnly cookie）。
- **邮件发送（SMTP，必配否则注册验证码 / 找回密码发不出）**：`mail/mail.service.ts` 用 nodemailer，需 `.env` 配 `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`MAIL_FROM`。默认 QQ 邮箱 `smtp.qq.com:465`（`secure:true`），`SMTP_PASS` 填邮箱**授权码**（非登录密码，QQ 邮箱设置里开启 IMAP/SMTP 后生成）。模板见 `.env.example`。transporter 在 service 构造时创建，改这些值后须重启。自检：`POST /api/auth/send-code {"email":...}` 返回 201 且日志出现「验证码已发送至 …」即通。

### 数据库 / TypeORM
- MySQL 8（docker-compose，宿主 `3307` → 容器 `3306`，库 `chem_qa`）。
- `TypeOrmModule` 配 **`synchronize: true`**：改实体即自动 ALTER 表，**无迁移文件**。重命名/删列要当心数据丢失。新增实体记得加进 `app.module.ts` 的 `entities` 数组。
- `import-content` 会 **TRUNCATE 重建 `knowledge_nodes`**；编辑 `content/chemistry/` 后需重跑。该表是自引用三级树（`parent_id` + `type`=module/chapter/topic，topic 的 `md_body` 存正文）。

### 脚本（scripts/）的 ESM 约定 ⚠️
- Node 22 + `scripts/tsconfig.json`（`module: ESNext` + `moduleResolution: bundler`）下，ts-node 把 `scripts/*.ts` 当 **ES module** 执行，CommonJS 全局 `__dirname` / `__filename` **不存在**，裸用会报 `__dirname is not defined in ES module scope`（导入/种子直接挂掉）。
- 正确写法（参考 `seed-training.ts` 与已修的 `import-content.ts`）：
  ```ts
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  ```
- **遗留待修**：`seed-exams.ts` 仍用裸 `__dirname`，运行前需先按上方改造，否则同样报错。`seed-accounts.ts` 已改为复用后端初始化逻辑，可创建 `vip@test.com` / `vie@test.com` / `free@test.com`，密码均为 `test123456`。

### LLM 接入（核心）
- 走 **OpenAI 兼容 `/v1/chat/completions`**，默认 DeepSeek（`LLM_API_BASE`/`LLM_API_KEY`/`LLM_MODEL_NAME`）。Key 必须与 Base URL 同平台。
- `llm.service.ts` `getConfig()` 校验占位符/长度；`chat.service.ts` `streamReply()` 是主流程：SSE 流式转发，对 429/5xx 重试（`MAX_RETRIES=2`），错误经 `common/llm-error.ts` `formatLlmError()` 转友好文案。所有 LLM 调用仅在服务端，用户不可见 Key。

### AI 问答的两个维度
- **roleMode（角色人设）**：`apps/api/src/common/role-prompts.ts` 定义 `AI_ROLES` / `ROLE_IDS` / 系统提示词。
- **askMode（知识点提问模式）**：`common/knowledge-prompts.ts` 的 `'explain' | 'practice' | 'free'`，`buildKnowledgeLlmContent()` 把知识点正文（截断 2000 字）拼进用户消息。知识点详情页的「学习讲解 / 出题练习」即对应 explain/practice。

### 会员与限流
- `User.plan`：`free | monthly | quarterly | yearly` + `planExpiresAt`。`common/membership.ts` `isPremium()` 判断有效期，`FREE_LIMITS`（5 条对话/天、1 个练习包/天、7 天历史）。
- 限流在后端 `chat.service.ts` 强制执行（跨该用户所有会话统计当日 user 消息数）。

### 前端约定
- 受保护路由用 `ProtectedRoute` 包裹（见 `App.tsx`）；登录后落地 `/`，已登录首页即 AI 对话工作区。
- 化学内容用 react-markdown + remark-math + rehype-katex（KaTeX）渲染公式；`ChemText`/`ChemistryDetailPage` 等。
- 部分 exam 功能有 localStorage 兜底（`lib/exam-fallback.ts`），后端不可用时本地存答题记录。

### ⚠️ 重复定义需同步维护
角色与会员常量在前后端各有一份，改动须两边对齐：
- 角色：`apps/api/src/common/role-prompts.ts` ↔ `apps/web/src/lib/roles.ts`
- 会员/限额：`apps/api/src/common/membership.ts` ↔ `apps/web/src/lib/membership.ts`

## OpenSpec 工作流

较大变更走 OpenSpec：提案存在 `openspec/changes/<name>/`（`proposal.md` 为什么/改什么、`design.md` 怎么做、`tasks.md` 步骤）。通过 `openspec` CLI + Cursor 命令 `/opsx-propose`、`/opsx-apply`、`/opsx-archive`、`/opsx-explore` 驱动（详见 `.cursor/skills/openspec-*/SKILL.md`）。实现现有未归档变更前，先读对应 `openspec/changes/<name>/` 下的 proposal 与 tasks。
