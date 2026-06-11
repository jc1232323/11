## Why

网站目前处于 MVP 阶段：首页内容单薄、知识点仅覆盖 2 个章节共 8 篇，AI 问答与知识库之间只有简单的「没懂？问 AI」跳转，无法按知识点学习或出题练习。AI 问答作为核心亮点，需要独立、完整的专属页面；首页应承载更丰富的产品内容与学习入口；知识库需扩展为更全面的三级分类体系；AI 必须能直接引用站内知识点进行讲解与练习。

## What Changes

- **首页内容丰富化**：增加模块概览、热门知识点、学习路径、AI 能力介绍、数据亮点等区块，减少空旷感
- **AI 问答独立页**：专属 `/ai` 路由（沉浸式对话工作台 + 蓝色主题），侧边栏承载化学知识、设置、关于等次要功能
- **知识库扩展与分类升级**：从「章节 → 知识点」扩展为「模块 → 章节 → 知识点」三级树；新增多个高中化学核心模块的 Markdown 内容与导入
- **AI 知识点联动**：对话页支持选择/绑定知识点；提供「学习讲解」与「出题练习」两种知识上下文模式；知识点详情页增加对应入口；后端在 prompt 中注入知识点正文

## Capabilities

### New Capabilities

- `homepage-content`: 首页内容丰富化与多区块布局
- `ai-chat-page`: AI 问答独立页面、侧边栏导航与蓝色视觉主题
- `knowledge-catalog`: 三级知识分类体系与内容扩展
- `ai-knowledge-context`: AI 引用知识点进行讲解与出题练习

### Modified Capabilities

（无既有 spec）

## Impact

- **前端**：`HomePage.tsx`、`Layout`/`AppShell`、`AiChatPage`（或重构 `ChatPage`）、`ChemistryPage`/`ChemistryDetailPage`、`knowledge-ask.ts`、`global.css`、`App.tsx`
- **后端**：`knowledge-node.entity`（type 扩展）、`knowledge.service`（三级树 API）、`chat.service`/`send-message.dto`（knowledgeSlug + askMode）、`role-prompts` 或 prompt 构建逻辑
- **内容**：`content/chemistry/` 新增多个模块/章节 Markdown；`import-content` 脚本适配三级结构
- **数据库**：`knowledge_nodes.type` 增加 `module`；迁移或 re-import 现有数据
