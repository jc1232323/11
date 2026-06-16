# 化学知识问答学习网站 — 产品需求文档（PRD）

| 字段 | 内容 |
|------|------|
| 版本 | v0.2（待你审查 → 确认后升为 v1.0） |
| 日期 | 2026-06-05 |
| 状态 | 草案 |

> **说明**：澄清问卷已跳过。下文 **§0 默认假设** 为推荐方案；你审查时可直接改 PRD 或回复我统一更新。

---

## 0. 默认假设（审查时可改）

| 主题 | 当前假设 |
|------|----------|
| 内容来源 | Markdown 批量导入 + 少量脚本维护 |
| 正文存储 | `.md` 放 Git，`content/chemistry/`；DB 存元数据与路径 |
| AI | DeepSeek，服务端代理，SSE 流式 |
| 账号 | 邮箱注册；未登录可浏览，**问答需登录** |
| 邮箱验证 | MVP **登录即用**；v1.1 改为必须验证后才能 AI |
| 目录体系 | **自定义**模块/章节名（不绑定单一教材版本） |
| MVP 范围 | 知识点浏览 + 双 AI 角色问答 + 响应式 UI |
| 商业化 | 不做；预留配额；MVP 登录用户日限 50 次问答 |
| 产品名 | **待定**（文档内称「本项目」） |
| SEO | MVP **纯 SPA**（Vite）；v1.1 再评估 SSG/SSR |
| 后端 | NestJS + Prisma + MySQL（Docker） |
| 前端 | React + TypeScript + Vite + Framer Motion |

---

## 1. 产品概述

### 1.1 背景与定位

面向全国**高中生**的**化学**在线学习站点：结构化浏览知识点，并通过大模型 **AI 问答** 辅助理解；用户可选择不同 **AI 导师人格**（直接讲思路 vs 引导自学）。

### 1.2 目标

- **学**：按模块/章节快速找到知识点，支持公式与配图
- **问**：针对题目或概念提问，获得与角色人设一致的辅导
- **营**：内容以 Markdown 维护，降低后续更新成本

### 1.3 非目标（MVP 明确排除）

| 不做 | 说明 |
|------|------|
| 多学科 | 仅化学 |
| 题库/错题本/组卷/拍搜 | 放 v2+ |
| 支付/会员/广告 | 仅预留数据结构与配置 |
| 微信/手机登录 | 仅预留接口设计 |
| 原生 App | 响应式 Web 即可 |
| 完整可视化 CMS | MVP 用导入脚本 + `published` 字段 |

---

## 2. 用户与场景

### 2.1 用户

- **主**：高一～高三学生
- **次（后期）**：教师、家长 — MVP 无独立角色

### 2.2 场景

| 场景 | 行为 | 系统 |
|------|------|------|
| 复习 | 从目录进入小节 | 展示渲染后的知识点 |
| 做题卡住 | 登录后进入问答，可选带入当前 `slug` | 流式 AI 回复 |
| 想自己推导 | 选「温柔老师」 | 分步引导，避免一次性给完整答案 |
| 赶时间 | 选「思路直达」 | 思路 + 关键步骤，必要时结论 |

**体验指标**：从首页到任意知识点 **≤3 次点击**（有完整目录时）。

---

## 3. 功能需求

### 3.1 知识点（化学）

#### 3.1.1 信息结构

```
模块 (L1)  →  章节 (L2)  →  知识点 (L3, 单篇 Markdown, 唯一 slug)
```

示例 L1：`物质的结构`、`化学反应与能量`  
示例 L2：`化学键`、`原电池`

#### 3.1.2 Markdown 规范

路径：`content/chemistry/<module-slug>/<chapter-slug>/<slug>.md`

```yaml
---
id: chem-redox-001          # 全局唯一，导入主键
slug: redox-electron-transfer # URL: /chemistry/:slug
title: 氧化还原反应的电子转移
module: 化学反应原理
chapter: 氧化还原反应
order: 10                   # 同章节内排序
tags: [氧化还原, 电子转移]
summary: 掌握氧化数与电子转移的对应关系
published: true
---
# 正文
支持 GFM、表格、**LaTeX**（`$...$` / `$$...$$`）、相对路径图片。
```

**导入命令** `pnpm import-content`：

- 校验必填字段、`id`/`slug` 唯一
- `published: false` 则不出现在公开目录
- 同 `id` → 更新 `version`、`updated_at`（非重复插入）
- `--dry-run` 仅报告不写库

#### 3.1.3 浏览能力

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 目录树 | P0 | L1→L2→L3，当前高亮 |
| 详情页 | P0 | Markdown + KaTeX |
| 面包屑 | P0 | 模块 > 章节 > 标题 |
| 从详情「提问」 | P0 | 跳转 `/chat?slug=xxx` |
| 上一篇/下一篇 | P1 | 按 `order` |
| 站内搜索 | P2 | v1.1 |
| 收藏 | P2 | v1.1，需登录 |

---

### 3.2 AI 问答

#### 3.2.1 接入

| 项 | 约定 |
|----|------|
| 模型 | DeepSeek（OpenAI 兼容 Chat Completions） |
| 密钥 | 仅 `DEEPSEEK_API_KEY` 在服务端 |
| 前端 | `POST /api/chat/completions`，**SSE** 流式 |
| 上下文 | System = 角色人设；可选附加当前知识点 `title` + `summary` |
| 会话 | MVP 前端会话内多轮；「新建对话」清空；持久化 v1.1 |

#### 3.2.2 角色

| ID | 名称 | 策略 |
|----|------|------|
| `direct` | 思路直达 | 简洁：思路、关键步骤，必要时明确结论 |
| `gentle_teacher` | 温柔老师 | 用提问拆解；**不**一次性给出完整最终答案 |

**安全边界（写入 System Prompt）**：

- 仅高中化学学习相关；拒绝代写、违法、非化学主诉求
- 超纲简要说明，不展开大学内容
- 不编造教材页码/考纲条文

#### 3.2.3 界面要素

- 角色选择（对话前或切换时提示是否新开对话）
- 消息列表（用户/助手，助手支持 MD+公式）
- 输入框：Enter 发送，Shift+Enter 换行
- **停止生成**、**新建对话**
- 关联知识点标签（从详情页带入时）

#### 3.2.4 权限与配额

| 用户状态 | 浏览 | AI 问答 |
|----------|------|---------|
| 未登录 | ✅ | ❌ 引导登录 |
| 已登录 | ✅ | ✅ 默认 50 次/日（`DAILY_CHAT_LIMIT` 可配） |

超限文案示例：「今日问答次数已用完，明天再来吧。」

---

### 3.3 账号（邮箱）

| 功能 | MVP | 说明 |
|------|-----|------|
| 注册 | P0 | 邮箱 + 密码（≥8 位，字母+数字） |
| 登录/登出 | P0 | Access JWT + HttpOnly Refresh |
| 邮箱验证 | 跳过 | v1.1：未验证不可 AI |
| 忘记密码 | P1 | 邮件链接 1h 有效 |
| 个人中心 | P2 | 展示邮箱、注册时间 |

---

### 3.4 运营（MVP 极简）

- 发布：改 front matter `published` + 重新导入
- 监控：`ai_request_logs`（user_id、tokens、status、时间）
- Admin 后台：v1.2

---

## 4. 页面与路由

| 路径 | 页面 | 登录 |
|------|------|------|
| `/` | 首页：价值说明、进入学习、登录入口 | 否 |
| `/chemistry` | 目录树 | 否 |
| `/chemistry/:slug` | 知识点详情 | 否 |
| `/chat` | AI 问答 | 是 |
| `/login` `/register` | 认证 | 否 |
| `/forgot-password` | 找回密码 | P1 |
| `/profile` | 个人中心 | 是 |
| `/terms` `/privacy` | 协议与隐私 | 否 |

---

## 5. UI/UX

### 5.1 视觉（来自你的草稿）

| 项 | 值 |
|----|-----|
| 主色 | 黑 `#0A0A0A`、白 `#FAFAFA` |
| 副色 | 蓝 `#2563EB`（链接、主按钮、选中态） |
| 原则 | 舒适、留白、偏学习工具 |

### 5.2 动效

- 库：**Framer Motion**（或等价 CSS 动画）
- 建议：页面淡入 200–300ms、目录展开、消息气泡轻上移
- 避免：强视差、自动播放背景视频

### 5.3 响应式

原文「**响铃式**」按 **响应式（Responsive）** 实现：

| 断点 | 布局要点 |
|------|----------|
| <768px | 目录抽屉；单列阅读 |
| 768–1279px | 可折叠侧栏 |
| ≥1280px | 侧栏目录 + 主内容 |

---

## 6. 非功能需求

| 类型 | 要求 |
|------|------|
| 性能 | 详情 LCP < 2.5s（常网）；AI 首 token < 3s（依赖模型） |
| 安全 | HTTPS；bcrypt；ORM 防注入；CORS 白名单；AI 鉴权 |
| 隐私 | 对话日志 30 天后清理（可配置） |
| 合规 | 用户协议、隐私政策、AI 免责声明（答案仅供参考） |
| 可用性 | 核心路径错误有明确中文提示 |

---

## 7. 技术架构

### 7.1 栈（来自你的草稿 + 补全）

| 层 | 技术 |
|----|------|
| 前端 | React 18、TypeScript、**Vite**、Tailwind、Framer Motion |
| 渲染 | react-markdown、**KaTeX** |
| 后端 | **NestJS**、TypeScript |
| ORM | **Prisma** |
| DB | **MySQL 8**（Docker Compose） |
| 仓库 | **pnpm monorepo**：`apps/web`、`apps/api`、`packages/shared` |
| 邮件 | Nodemailer（开发可用 Mailpit） |

**前后端分离**：Web 静态部署；API 独立端口；仅 REST + SSE。

### 7.2 部署示意（MVP）

```
Browser → CDN/Nginx(前端) → NestJS:3000 → MySQL
                              ↓
                         DeepSeek API
```

### 7.3 Docker MySQL（开发环境）

`docker-compose.yml` 建议值（**仅本机开发，生产必须更换**）：

```yaml
# 实施时写入 compose，并在 README 说明
MYSQL_ROOT_PASSWORD: chem_root_dev_change_me
MYSQL_DATABASE: chem_learn
MYSQL_USER: chem_app
MYSQL_PASSWORD: chem_app_dev_change_me
ports: "3306:3306"
```

**连接串**（交给你本地使用）：

```
mysql://chem_app:chem_app_dev_change_me@127.0.0.1:3306/chem_learn
```

### 7.4 环境变量

```bash
# API
DATABASE_URL=mysql://chem_app:chem_app_dev_change_me@localhost:3306/chem_learn
JWT_SECRET=<随机长字符串>
JWT_REFRESH_SECRET=<随机长字符串>
DEEPSEEK_API_KEY=<你的密钥>
DEEPSEEK_BASE_URL=https://api.deepseek.com
DAILY_CHAT_LIMIT=50
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS=
FRONTEND_URL=http://localhost:5173

# Web
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 8. 数据模型

```text
users
  id, email, password_hash, email_verified_at?, created_at

knowledge_nodes
  id, slug, title, module, chapter, sort_order,
  summary, content_path, published, version, updated_at

chat_sessions
  id, user_id, role (direct|gentle_teacher), knowledge_slug?, created_at

chat_messages
  id, session_id, role (user|assistant), content, created_at

ai_request_logs
  id, user_id, tokens_in, tokens_out, model, status, created_at
```

---

## 9. API 列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/refresh` | 刷新 token |
| POST | `/api/auth/logout` | 登出 |
| POST | `/api/auth/forgot-password` | P1 |
| GET | `/api/knowledge/tree` | 公开目录 |
| GET | `/api/knowledge/:slug` | 详情（含渲染所需字段） |
| POST | `/api/chat/completions` | SSE，需登录 |
| GET | `/api/users/me` | 当前用户 |

---

## 10. 版本路线

| 版本 | 交付 |
|------|------|
| **MVP** | 目录、详情、导入、邮箱登录、双角色 AI、响应式、Docker MySQL、README 含密码说明 |
| v1.1 | 邮箱验证、忘记密码、对话持久化、站内搜索 |
| v1.2 | Web Admin、收藏、上下篇、SEO/SSG 评估 |
| v2.0 | 会员配额、微信登录、练习模块 |

---

## 11. MVP 验收清单

- [ ] 导入 ≥10 条化学知识点，公式与图片显示正常
- [ ] 未登录可浏览；登录后可 AI，超日限有提示
- [ ] 两种角色均可流式对话 ≥5 轮，可中止生成
- [ ] 「温柔老师」人工抽 10 题：不一次性给出完整数值答案
- [ ] 375 / 768 / 1280px 布局可用，无严重横向滚动
- [ ] 重复导入同 `id` 为更新
- [ ] 前端产物与请求中无 `DEEPSEEK_API_KEY`
- [ ] `docker compose up` 可启 MySQL，README 写明上述开发密码

---

## 12. 风险

| 风险 | 应对 |
|------|------|
| 模型不可用/限流 | 错误提示 + 重试；日志告警 |
| AI 答案错误 | 页脚免责声明 |
| 内容版权 | 仅原创或已授权材料 |
| 成本 | token 日志 + 日配额 |

---

## 13. 审查时请确认或修改（对应 §0）

你可直接在本文件改 §0 表格，或回复例如：

`验证改必须；目录改人教版；产品名：化学通；SEO要`

| # | 项 | 当前默认 |
|---|-----|----------|
| 1 | 邮箱验证时机 | MVP 跳过 |
| 2 | 正文存储 | Git + DB 元数据 |
| 3 | 产品名称 | 待定 |
| 4 | 目录体系 | 自定义 |
| 5 | SEO | MVP 不做 |
| 6 | AI 厂商 | DeepSeek |
| 7 | 后端框架 | NestJS（若要 Express 可改） |

---

## 14. 用户故事

| ID | 作为 | 我想要 | 以便 |
|----|------|--------|------|
| US-01 | 学生 | 按章节浏览化学知识 | 系统复习 |
| US-02 | 学生 | 用温柔老师问难题 | 自己推出解题步骤 |
| US-03 | 学生 | 用思路直达看关键步骤 | 节省时间 |
| US-04 | 维护者 | 运行导入脚本更新内容 | 不发版也能更新知识 |
| US-05 | 学生 | 在手机上看知识点 | 随时随地学习 |

---

## 15. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | — | 你的原始 15 行草稿 |
| v0.2 | 2026-06-05 | 结构化完整 PRD + §0 默认假设 |

---

**请你审查**：整体范围（§1.3）、双 AI 角色（§3.2.2）、技术栈（§7）、MySQL 开发密码（§7.3）。确认后回复「定稿」或给出 §13 修改项，我可升为 **v1.0** 并开始搭项目骨架。
