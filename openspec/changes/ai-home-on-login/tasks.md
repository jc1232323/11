## 1. 首页即 AI 对话

- [x] 1.1 改造 `HomePage.tsx`：已登录渲染 `ChatWorkspace`（蓝色背景容器）；未登录保留营销首页
- [x] 1.2 登录成功默认跳转 `/`（确认 `LoginPage`）

## 2. 侧边栏精简

- [x] 2.1 从 `Layout.tsx` 侧边栏移除「AI 问答」导航项
- [x] 2.2 侧边栏 Logo 链接 `/`；公共顶栏已登录用户移除「AI 问答」按钮

## 3. 路由收敛

- [x] 3.1 `App.tsx`：`/ai` 重定向到 `/`；移除 `AiChatPage` 独立路由
- [x] 3.2 `ChatRedirect.tsx` 目标改为 `/`
- [x] 3.3 `ChatWorkspace.tsx` 与 `ChemistryDetailPage.tsx` 跳转路径改为 `/`

## 4. 清理与验收

- [x] 4.1 删除或废弃 `AiChatPage.tsx`
- [x] 4.2 验证：登录即对话、侧栏无 AI 项、知识点跳转、`/ai` 兼容重定向
