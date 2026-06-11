## Why

上一版实现将 AI 问答放在独立 `/ai` 页面，并在侧边栏单独列出「AI 问答」入口，与用户预期不符。用户登录后应**直接进入 AI 对话界面**（首页即对话框），侧边栏只承载化学知识、设置、关于等辅助功能，不应再出现「AI 问答」导航项。

## What Changes

- 登录用户访问 `/` 时直接展示 `ChatWorkspace`（AI 对话框），而非营销型首页
- 侧边栏移除「AI 问答」项；Logo 点击回到首页（即 AI 对话）
- 未登录用户访问 `/` 仍展示现有营销首页（注册/登录引导）
- `/ai`、`/chat` 重定向到 `/`，保留 `knowledgeAsk` 等 navigation state
- 知识点页「学习讲解」「出题练习」跳转目标改为 `/`
- 登录成功后默认落地 `/`（已是 AI 对话）

## Capabilities

### New Capabilities

- `login-default-ai-home`: 登录后首页即 AI 对话，侧边栏不含 AI 导航项

### Modified Capabilities

（无既有 archived spec；本次为对 `enrich-content-ai-knowledge` 实现的方向修正）

## Impact

- **前端**：`HomePage.tsx`、`Layout.tsx`（侧边栏导航）、`App.tsx`（路由合并/重定向）、`ChatWorkspace.tsx`（跳转路径）、`ChatRedirect.tsx`、`ChemistryDetailPage.tsx`
- **可删除**：`AiChatPage.tsx`（逻辑并入首页）或保留为薄重定向
- **后端**：无变更
