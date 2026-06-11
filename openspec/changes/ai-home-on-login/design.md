## Context

当前实现：

- 登录后侧边栏含「AI 问答 → /ai」
- `/` 为内容丰富营销首页，AI 在 `/ai` 独立路由
- 用户登录期望：一进来就能对话，侧边栏只管其他功能

已有 `ChatWorkspace` 组件承载完整对话逻辑（会话、知识点联动、流式回复），可直接复用。

## Goals / Non-Goals

**Goals:**

- 登录用户打开网站即见 AI 对话框（主内容区）
- 侧边栏仅：化学知识、设置、关于 + 用户/退出
- Logo 点击返回 `/`（AI 对话）
- 兼容 `/ai`、`/chat` 旧链接与知识点跳转

**Non-Goals:**

- 不改变对话功能、知识点联动、蓝色主题
- 不删除未登录营销首页
- 不改后端 API

## Decisions

### 1. 首页双态渲染

`HomePage.tsx`：

```tsx
if (user) return <ChatWorkspace />; // 包在 ai-page-bg 容器
return <MarketingHome />;           // 现有营销内容
```

**理由**：单一路由 `/`，登录态决定内容，符合「登录即对话」。

### 2. 侧边栏导航精简

```ts
const sidebarNav = [
  { to: '/chemistry', label: '化学知识', icon: '📚' },
  { to: '/settings', label: '设置', icon: '⚙️' },
  { to: '/about', label: '关于', icon: 'ℹ️' },
];
```

首页（AI 对话）无侧栏高亮项；用户在 `/` 时侧栏无 active 项，或仅 Logo 区暗示「当前在首页」。

**理由**：用户明确「侧边栏不应有 AI 问答」。

### 3. 路由收敛

| 路由 | 行为 |
|------|------|
| `/` | 登录 → ChatWorkspace；未登录 → 营销页 |
| `/ai` | `<Navigate to="/" state={...} />` |
| `/chat` | 同上（已有 ChatRedirect，改目标为 `/`） |

删除 `AiChatPage` 独立路由，或保留 redirect 组件。

### 4. 知识点跳转

`ChemistryDetailPage` 与 `ChatWorkspace` 内 `navigate` 目标由 `/ai` 改为 `/`，`replace: true` 清除 state。

### 5. 公共顶栏（未登录 / 偶发访问）

未登录顶栏 CTA「AI 问答」改为「登录后开始」或链到 `/login`；已登录但在 PublicLayout 场景不出现（登录后走 AppShell）。

## Risks / Trade-offs

- **[Risk] 登录用户无法从 UI 直达营销介绍页** → 可接受；AI 即核心，介绍内容面向游客
- **[Trade-off] `/` 无侧栏 active 态** → Logo 即「回对话」锚点，符合预期

## Migration Plan

1. 改 `HomePage` 登录分支渲染 `ChatWorkspace`
2. 改 `Layout` 侧边栏 nav
3. 改 `App.tsx`：`/ai` 重定向 `/`；移除 `AiChatPage` 路由
4. 更新 `ChatRedirect`、`ChatWorkspace`、`ChemistryDetailPage` 路径
5. 验证登录 → `/` 对话、知识点跳转、侧栏切换

## Open Questions

- 无阻塞项。
