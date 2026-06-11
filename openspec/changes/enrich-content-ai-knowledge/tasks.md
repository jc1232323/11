## 1. 知识库三级结构与内容

- [x] 1.1 扩展 `KnowledgeNode.type` 支持 `module`，更新 import 脚本适配 `content/chemistry/<module>/<chapter>/<topic>.md`
- [x] 1.2 将现有「物质的量」「离子反应」归入模块（如 `foundations`），re-import 保证 slug 不变
- [x] 1.3 新增 Markdown：物质的结构、化学反应与能量、有机化学基础等模块（≥20 篇 topic）
- [x] 1.4 更新 `KnowledgeService.getTree()` 返回 `modules → chapters → topics` 嵌套结构
- [x] 1.5 重构 `ChemistryPage.tsx` 展示三级分类树

## 2. 蓝色主题与侧边栏外壳

- [x] 2.1 扩展 `global.css` 蓝色变量与 `.app-shell`、`.sidebar` 样式
- [x] 2.2 实现 `AppShell` 侧边栏（AI 问答 /ai、化学、设置、关于），登录后替代顶栏水平导航
- [x] 2.3 移动端侧边栏折叠；登录/注册页保持无侧栏布局

## 3. AI 问答独立页

- [x] 3.1 创建或重构 `AiChatPage`（`/ai`）：沉浸式蓝色主题聊天工作台
- [x] 3.2 从 `ChatPage` 抽取/迁移 `ChatWorkspace` 逻辑；`/chat` 重定向 `/ai` 保留 state
- [x] 3.3 `App.tsx` 注册 `/ai` 路由（`ProtectedRoute` + `AppShell`）

## 4. AI 知识点联动

- [x] 4.1 扩展 `SendMessageDto` 与 `ChatService`：支持 `knowledgeSlug`、`askMode`（explain/practice/free）
- [x] 4.2 服务端按 slug 加载 `mdBody` 并注入 mode 专用 prompt（讲解 / 出题练习）
- [x] 4.3 AI 页增加知识点选择器（树形搜索）与模式切换（学习讲解 / 出题练习）
- [x] 4.4 更新 `knowledge-ask.ts` 支持 `mode`；`ChemistryDetailPage` 增加「学习讲解」「出题练习」按钮
- [x] 4.5 前端 `streamChat` API 传递 `knowledgeSlug` 与 `askMode`

## 5. 首页内容丰富化

- [x] 5.1 重构 `HomePage.tsx`：hero + 模块速览（API）+ 热门知识点 + AI 能力介绍 + 特色数据条
- [x] 5.2 已登录 CTA：主按钮 → `/ai`，次按钮 → `/chemistry`；未登录引导注册/登录
- [x] 5.3 确认首页不嵌入完整聊天 UI

## 6. 验收

- [x] 6.1 首页多区块展示，无空旷感；模块/知识点链接可点击
- [x] 6.2 `/ai` 独立蓝色对话页，侧边栏导航正常
- [x] 6.3 知识库 ≥4 模块、≥20 知识点，三级浏览正常
- [x] 6.4 知识点页「学习讲解」「出题练习」跳转 AI 并带入正确上下文
- [x] 6.5 旧 `/chat` 与「没懂？问 AI」链接仍可用
