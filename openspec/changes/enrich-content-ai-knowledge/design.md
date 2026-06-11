## Context

当前状态：

- **首页**：hero + 3 张功能卡片，信息密度低
- **布局**：顶栏水平导航，`/chat` 为通用卡片式对话页
- **知识库**：DB `knowledge_nodes` 仅 `chapter` / `topic` 两级；内容仅「物质的量」「离子反应」各 4 篇
- **AI 联动**：`knowledge-ask.ts` 仅支持「讲解」一种模式，前端把 mdBody 拼进 prompt，后端不感知 slug

PRD 已定义三级结构（模块 → 章节 → 知识点）与 Markdown 导入流程，但实现未对齐。

## Goals / Non-Goals

**Goals:**

- 首页成为内容丰富的产品门户（未登录可浏览介绍，已登录可快速进入学习与 AI）
- `/ai` 为登录用户的 AI 核心工作台，视觉独立、蓝色主题突出
- 侧边栏统一承载非 AI 功能导航
- 知识库覆盖高中化学主要模块（至少新增 3–4 个模块、每模块 2+ 章节、每章节 2+ 知识点）
- AI 可绑定知识点，支持 `explain`（讲解）与 `practice`（出题练习）模式

**Non-Goals:**

- 不做完整题库系统、错题本、自动批改
- 不做深色模式、新 UI 框架
- 不做可视化 CMS（仍用 Markdown + import 脚本）
- MVP 练习题为 AI 生成文本题，不做结构化答题卡

## Decisions

### 1. 信息架构

```
/                 丰富首页（门户）
/ai               AI 问答专属页（登录）
/chemistry        三级分类浏览
/chemistry/:slug  知识点详情
/settings, /about 侧边栏可达
```

首页 **不放** 完整聊天 UI；主 CTA 引导至 `/ai`。

### 2. AppShell 侧边栏布局（登录后）

左侧边栏：Logo、AI 问答 (/ai)、化学知识、设置、关于、用户/退出。主内容区渲染 `<Outlet />`。登录/注册页无侧边栏。

移动端：汉堡菜单 + overlay 侧栏。

### 3. 知识三级树

**选择**：扩展 `KnowledgeNode.type` 为 `'module' | 'chapter' | 'topic'`。

- `module`：`parentId = null`
- `chapter`：`parentId = module.id`
- `topic`：`parentId = chapter.id`，含 `mdBody`

**API 变更**：

- `GET /knowledge/tree` 返回嵌套 `{ modules: [{ chapters: [{ topics }] }] }`
- 保留 `GET /knowledge/:slug` 仅用于 topic

**内容路径**（对齐 PRD）：

```
content/chemistry/<module-slug>/<chapter-slug>/<topic-slug>.md
```

现有 2 章归入模块，如 `foundations`（化学基础）下挂「物质的量」「离子反应」。

### 4. 内容扩展范围（首批）

| 模块 | 章节示例 | 规模 |
|------|----------|------|
| 化学基础（已有重组） | 物质的量、离子反应 | 8 篇（已有） |
| 物质的结构 | 原子结构、化学键 | 各 2–3 篇 |
| 化学反应与能量 | 反应热、反应速率 | 各 2 篇 |
| 有机化学基础 | 烃、官能团 | 各 2 篇 |

合计约 20+ 篇，由 import 脚本写入 DB。

### 5. AI 知识点上下文

**前端**：

- `AiChatPage` 顶部增加「关联知识点」选择器（可搜索的树形下拉或弹层）
- 两种快捷模式按钮：**学习讲解** / **出题练习**
- 从知识点页跳转时携带 `{ knowledgeAsk: { slug, title, chapterTitle, mdBody, mode } }`

**后端**：

- `SendMessageDto` 增加可选字段：`knowledgeSlug?: string`、`askMode?: 'explain' | 'practice' | 'free'`
- `ChatService.streamReply`：若提供 slug，从 DB 加载 `mdBody`（截断至 2000 字）注入 system 或首条 context
- `practice` 模式追加 prompt：「根据以下知识点出 3–5 道练习题（含答案与解析），难度适合高中生」

**备选**：纯前端拼 prompt（现状）—— 无法保证内容最新且浪费 token 重复传正文；**改为服务端按 slug 加载**。

### 6. 首页内容区块

1. Hero（标题 + 双 CTA：学知识 / 问 AI）
2. 模块速览卡片（来自 `/knowledge/tree` 前 4 模块）
3. 热门知识点列表（按模块展示 6–8 条链接）
4. AI 能力展示（双角色说明 + 知识点联动示意）
5. 学习数据/特色条（如「20+ 知识点」「流式 AI」「公式渲染」）

未登录与已登录共用布局，CTA 根据登录态切换。

### 7. 蓝色主题

扩展 `global.css` 变量；`/ai` 页面与侧边栏使用蓝色渐变与强调色；首页 hero 与 CTA 强化蓝色；化学阅读页保持中性白底。

## Risks / Trade-offs

- **[Risk] 三级树改动破坏现有 ChemistryPage** → 同步更新前端树形渲染与 import 脚本，re-import 迁移
- **[Risk] 大量 Markdown 撰写耗时** → 首批每篇控制在 800–1500 字，模板化 frontmatter
- **[Risk] AI 出题质量不稳定** → prompt 约束题型（选择/填空/简答）与难度；练习模式标注「AI 生成，仅供参考」
- **[Trade-off] 侧边栏缩窄化学阅读区** → 内容区 `max-width` 保持 760px 居中

## Migration Plan

1. 扩展 entity + migration + import 脚本
2. Re-import 现有内容并新增 Markdown
3. 更新 knowledge API 与 Chemistry 页面
4. 实现 AppShell + 首页丰富化
5. 实现 `/ai` 页与后端 knowledge context
6. 更新知识点详情页双入口（讲解 / 练习）
7. `/chat` 重定向 `/ai` 兼容旧链接

## Open Questions

- 无阻塞项。练习题为文本形式，无需用户作答提交功能。
