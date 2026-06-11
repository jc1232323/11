## Why

当前 AI 问答仅提供「思路直达」「温柔老师」两种角色，难以覆盖高中生多样化的学习场景（临考冲刺、零基础入门、实验题、错题复盘、竞赛拓展等）。扩展 AI 角色库可提升产品差异化与辅导针对性，让用户按当前学习阶段选择最合适的辅导风格。

## What Changes

- 新增 **8 个 AI 角色**（保留现有 2 个），共 **10 个**可选角色
- 后端 `ROLE_PROMPTS` 扩展为统一角色注册表（id、名称、简介、system prompt）
- 前端聊天页角色选择器改为分组下拉或卡片列表，展示角色名称与一句话说明
- 设置页「默认 AI 角色」同步支持全部角色
- 扩展 TypeScript 类型与 DTO 校验（`roleMode` / `defaultRole` 枚举）
- 旧会话若使用已存在角色 id 保持兼容；新角色 id 为新增 slug

## Capabilities

### New Capabilities

- `ai-role-catalog`: AI 角色目录、prompt 定义与前后端选型 UI

### Modified Capabilities

（无既有 archived spec）

## Impact

- **后端**：`role-prompts.ts`、各 DTO、`User`/`ChatSession` entity 类型注释
- **前端**：`ChatWorkspace`、`SettingsPage`、`api.ts` 类型、首页/Guest 文案
- **数据库**：`role_mode` / `default_role` 字段已为 varchar(32)，无需迁移，仅扩枚举值
- **待审查**：角色清单与 prompt 人设见 `design.md` §角色目录，**实现前需用户确认**

## 角色清单（请审查）

| # | ID | 显示名 | 适用场景 |
|---|-----|--------|----------|
| 1 | `direct` | 思路直达 | **已有** 高效解题，关键步骤 |
| 2 | `guide` | 温柔老师 | **已有** 引导自学，不直接给答案 |
| 3 | `gaokao-sprint` | 高考冲刺 | 考前抢分、高频考点、应试技巧 |
| 4 | `foundation` | 基础入门 | 零基础/薄弱生，通俗类比 |
| 5 | `exam-analyst` | 审题拆题 | 读题、考点定位、解题框架 |
| 6 | `experiment` | 实验达人 | 实验操作、现象、误差分析 |
| 7 | `formula-derive` | 公式推导 | 公式来历、推导过程、单位换算 |
| 8 | `mistake-review` | 错题复盘 | 分析错因、归纳陷阱、举一反三 |
| 9 | `competition` | 竞赛拓展 | 学有余力，深度拓展与竞赛题 |
| 10 | `memory-helper` | 记忆助手 | 口诀、要点卡片、易混对比 |
