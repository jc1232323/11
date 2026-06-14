# 设置页新功能：暗色模式 + 语言切换

## 方案

### 1. 新建 ThemeContext（暗色模式 + 语言）

**`apps/web/src/context/ThemeContext.tsx`**

- 管理 `theme: 'light' | 'dark'` 和 `locale: 'zh' | 'en'`
- 持久化到 localStorage
- 切换暗色模式时在 `<html>` 添加 `data-theme="dark"` 属性
- 提供 `toggleTheme()` 和 `setLocale()` 方法

### 2. 暗色模式 CSS 变量

在 `global.css` 中添加 `[data-theme="dark"]` 选择器，覆盖所有颜色变量为暗色配色。

### 3. i18n 翻译系统

**`apps/web/src/lib/i18n.ts`**

- 简单键值对翻译方案（不引入重依赖）
- 导出 `t(key)` 函数 + `useT()` hook
- 翻译文件覆盖所有 UI 静态文本（侧边栏、设置页、按钮等）

### 4. 更新 SettingsPage

新增两个设置卡片：
- 暗色模式开关（Toggle switch）
- 语言选择（中文/English 下拉）

### 5. 更新入口

`main.tsx` 中包裹 `ThemeProvider`。

## 文件变更

- 新建：`apps/web/src/context/ThemeContext.tsx`
- 新建：`apps/web/src/lib/i18n.ts`
- 修改：`apps/web/src/styles/global.css`（加暗色变量）
- 修改：`apps/web/src/pages/SettingsPage.tsx`（加两个卡片）
- 修改：`apps/web/src/main.tsx`（加 ThemeProvider）
- 修改：`apps/web/src/components/Layout.tsx`（侧边栏文本用 t()）
