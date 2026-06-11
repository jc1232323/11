## 1. 角色定义（待审查通过后）

- [x] 1.1 在 `role-prompts.ts` 定义 `AI_ROLES` 常量（10 角色 id/label/description/prompt）
- [x] 1.2 编写 8 个新角色 system prompt（保留并微调 direct/guide）
- [x] 1.3 前端 `lib/roles.ts` 同步角色元数据（label、description、分组）

## 2. 后端类型与校验

- [x] 2.1 扩展 `RoleId` 类型；更新 SendMessage/CreateSession/UpdateSession/UpdateProfile DTO 的 `@IsIn` 枚举
- [x] 2.2 更新 `User`、`ChatSession` entity 与 service 中的类型引用

## 3. 前端 UI

- [x] 3.1 `ChatWorkspace` 角色选择器改为 optgroup 分组 + 当前角色 description 提示
- [x] 3.2 `SettingsPage` 默认角色下拉同步全部角色
- [x] 3.3 更新 `api.ts` 中 `roleMode` / `defaultRole` 类型

## 4. 文案与验收

- [x] 4.1 更新 Guest 首页等平台特色文案（提及多角色）
- [x] 4.2 逐角色试聊验证风格差异；旧会话 direct/guide 正常
