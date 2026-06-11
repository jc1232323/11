# 化学知识问答 · UI 设计规范（design.md）

> 本文件是前端 UI 的**唯一事实来源（Single Source of Truth）**。
> 任何新增页面 / 组件 / 样式改动，都必须先对照本文件；如需突破规范，先更新本文件再写代码，避免设计跑偏。
>
> 当前版本：v1.0（基于现有实现沉淀）· 维护者在每次重大改版后同步更新「修订记录」。

---

## 0. 设计定位（North Star）

| 维度 | 取向 |
|------|------|
| **产品性质** | 学习工具，不是营销官网。**信息清晰 > 视觉炫技** |
| **气质** | 克制、专业、现代——「DeepSeek 风」：浅灰底 + 单一蓝主色 + 大量留白 |
| **目标用户** | 高中生。界面要**不分心、可长时间阅读**，公式/表格清晰 |
| **一句话** | 像一个安静、可靠的化学自习室，AI 是坐在旁边的老师 |

**三条铁律：**
1. **单主色克制用色**——蓝色 `--primary` 只用于「可交互 / 选中 / 强调」，正文永远是中性灰黑。禁止彩虹色、紫色渐变背景等「AI 感」配色。
2. **留白即设计**——优先用间距和层级表达结构，而不是加边框、加阴影、加分割线。
3. **动效服务于理解**——只做入场淡入和轻微上移，时长 200–400ms。禁止视差、自动轮播、夸张弹跳。

---

## 1. 设计令牌（Design Tokens）

所有 token 定义在 `apps/web/src/styles/global.css` 的 `:root`，**改色只改这里，不要在页面里写死十六进制**。

### 1.1 颜色

```css
/* 主色 —— 仅用于交互/选中/强调 */
--primary:        #4f6ef7;   /* 主按钮、链接、选中态、图标强调 */
--primary-hover:  #3b5ce5;   /* hover 加深 */
--primary-light:  #eef2ff;   /* 选中底色、图标底、tag 底 */
--primary-muted:  #f5f7ff;   /* 大面积浅蓝区块（如 AI 引导条） */
--primary-glow:   rgba(79,110,247,0.12); /* focus ring */

/* 中性色 —— 承载 95% 的界面 */
--bg:            #f7f8fa;    /* 页面底 */
--bg-elevated:   #ffffff;    /* 卡片/浮层 */
--bg-subtle:     #f0f2f5;    /* 次级底块 */
--sidebar-bg:    #fafbfd;    /* 侧栏底 */
--text:          #1a1a2e;    /* 标题/正文主色（近黑带蓝） */
--text-secondary:#5a5a72;    /* 次要正文 */
--text-muted:    #8e8ea0;    /* 辅助说明/占位 */
--border:        #e8e8ef;    /* 常规边框 */
--border-light:  #f0f0f5;    /* 分割线/弱边框 */

/* 语义色 —— 只用于状态反馈 */
--danger:  #ef4444;   /* 错误、删除 */
--success: #10b981;   /* 成功 */
--warning: #f59e0b;   /* 来源/提示标签 */
```

**品牌渐变**（仅用于 logo 文字、Hero 标题高亮，**不要滥用到按钮/背景**）：
```css
linear-gradient(135deg, var(--primary), #6366f1)
```

> ⚠️ 已知不一致：`--surface-chat-user` 定义了用户气泡渐变，但实际气泡用的是纯色 `--primary`。**新代码统一用纯色 `--primary`**，渐变 token 视为废弃。

### 1.2 圆角

```css
--radius-sm: 8px;    /* 小控件：输入框内按钮、tag、select */
--radius:    12px;   /* 默认：按钮、输入框 */
--radius-lg: 16px;   /* 卡片、容器 */
--radius-xl: 20px;   /* 大卡片：登录卡、Hero mock、模块卡 */
```
胶囊形（badge / 计数 / tag）统一用 `border-radius: 999px`。

### 1.3 阴影

```css
--shadow-sm:      0 1px 3px rgba(0,0,0,0.04);   /* 卡片静置 */
--shadow:         0 4px 16px rgba(0,0,0,0.06);  /* 卡片 hover / 容器 */
--shadow-lg:      0 8px 32px rgba(0,0,0,0.08);  /* 浮层、登录卡、抽屉 */
--shadow-primary: 0 4px 16px rgba(79,110,247,0.2); /* 主按钮 */
```
阴影要**软而浅**，绝不用深黑硬投影。

### 1.4 间距与尺寸

- 间距用 `rem`，常用刻度：`0.25 / 0.5 / 0.75 / 1 / 1.25 / 1.5 / 2 / 2.5 / 3 rem`。
- 内容容器：`.container { width: min(1120px, 100% - 2rem); margin: 0 auto; }`
- 侧栏宽 `--sidebar-width: 260px`；聊天会话列宽 `240px`。
- 阅读型页面（详情/设置/关于/登录）**限宽**：详情 `760px`、设置 `560px`、关于 `680px`、登录卡 `420px`——保证行宽舒适。

### 1.5 动效

```css
--ease:     cubic-bezier(0.4, 0, 0.2, 1);  /* 全站统一缓动 */
--duration: 0.2s;                          /* 交互态过渡 */
```

---

## 2. 字体与排版

```css
font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC',
             'Helvetica Neue', system-ui, sans-serif;
line-height: 1.6;
```

- **正文/界面**：系统字体栈（中文走 PingFang SC），保证多端渲染一致、加载零成本。
- **公式**：KaTeX（CDN 引入 `katex.min.css`），`.chat-markdown .katex { font-size: 1em }` 保持与正文同号。
- 阅读正文行高放宽到 `1.8`（详情页），聊天气泡 `1.65`。

**字号 / 字重层级（实际在用）：**

| 角色 | size | weight |
|------|------|--------|
| Hero 主标题 | `clamp(2rem, 4.5vw, 2.75rem)` | 800 |
| 页面 H1 | `1.4–1.6rem` | 700 |
| 卡片/区块 H2 | `1.05–1.25rem` | 600–700 |
| H3 / 小标题 | `0.9–1.05rem` | 600 |
| 正文 | `0.9–0.95rem` | 400–450 |
| 辅助/标签 | `0.75–0.85rem` | 500 |
| 大写小标 kicker | `0.75–0.78rem` + `letter-spacing: 0.04–0.08em` + `uppercase` | 600–700 |

> 标题用 `letter-spacing: -0.02em` 收紧（Hero），小标签用正 `letter-spacing` + 大写拉开——这是本设计的排版细节签名，请沿用。

---

## 3. 布局系统

入口在 `components/Layout.tsx`，根据登录态切换两种骨架：

### 3.1 PublicLayout（未登录 / 登录注册页）
- 顶部 **sticky 毛玻璃头**：`background: rgba(255,255,255,0.85); backdrop-filter: blur(12px) saturate(180%)`。
- 左侧 logo「化学**问答**」（「问答」走品牌渐变），右侧导航 + 登录/注册按钮。
- 登录/注册页隐藏 header，居中卡片。

### 3.2 AppShell（已登录）
- 左侧固定 **260px 侧栏**：logo + 主导航（AI 问答 / 化学知识 / 专题训练 / 设置 / 关于）+ 底部用户名 + 退出。
- 导航项选中态：`--primary-light` 底 + `--primary` 字 + 加粗 + 淡蓝边。
- 右侧主区 `app-main-content`，padding `1.5rem 2rem 2.5rem`。

### 3.3 响应式断点
**唯一主断点：`768px`。**

| 宽度 | 行为 |
|------|------|
| ≥ 768px | 侧栏常驻 / 双栏布局 |
| < 768px | 侧栏变**抽屉**（`translateX(-100%)`，`.open` 滑入 + 遮罩）；顶部出现 `mobile-topbar`（汉堡 + logo）；多栏塌成单栏 |

新页面**必须**自测 375 / 768 / 1280px 三档，无横向滚动。

---

## 4. 组件规范

### 4.1 按钮（`.btn`）
基类：inline-flex 居中、`gap 0.5rem`、`padding 0.6rem 1.25rem`、`radius`、`font-weight 500`、`font-size 0.9rem`、`:active { scale(0.97) }`、`:disabled { opacity 0.5 }`。

| 变体 | 用法 | 样式 |
|------|------|------|
| `.btn-primary` | 主操作（每屏≤1个主操作） | 蓝底白字 + `--shadow-primary`，hover 上移 1px |
| `.btn-ghost` | 次操作 | 透明 + 灰边，hover 变蓝边蓝字 |
| `.btn-lg` | Hero/落地大按钮 | `padding 0.75rem 1.5rem` |

图标按钮统一 lucide 图标 + 文案，图标在前。

### 4.2 卡片（`.card` / `.card-hover`）
白底 + `--border` + `--radius-lg` + `--shadow-sm`；`.card-hover:hover` 上移 2px 加深阴影。内边距常用 `1.5rem`。

### 4.3 表单
- `.input` / `.textarea`：`1.5px` 边框，focus 时变蓝边 + `0 0 0 3px var(--primary-glow)` 光环。
- `.label`：`0.875rem` / 500 / `--text-secondary`。
- 认证页输入框带**左侧 lucide 图标**（`auth-input` 左 padding 2.5rem）。
- 错误用 `.error-text` 或 `.auth-error`（红字 + 浅红底）。

### 4.4 图标
- 库：**lucide-react**（唯一图标库，勿混入其它）。
- 尺寸：`14–24px`；`strokeWidth: 1.6`（装饰/大图标）～ `2`（按钮内/小图标）。
- 图标容器：`--primary-light` 底 + `--primary` 色 + 圆角方块（`34–48px`）——页面头部、特性卡通用此模式。

### 4.5 聊天气泡（`cw-bubble`）
- 用户：右对齐、`--primary` 纯底白字、`30px` 圆形头像「你」。
- AI：左对齐、白底 + 弱边 + `--shadow-sm`、头像「AI」（浅蓝底蓝字）。
- 最大宽 `80%`，入场 `fadeInUp 0.3s`。

### 4.6 标签 / 徽章
- 知识/角色 tag：`--primary-light` 底 + `--primary` 字 + 胶囊。
- 来源类（warning）：`rgba(245,158,11,0.12)` 底 + `#b45309` 字。
- 计数徽章：`--primary-light` 胶囊。

### 4.7 空 / 加载 / 错误态（**强制三态齐全**）
- 加载：lucide `Loader2` + `animation: spin 1s linear infinite` + 文案「加载中…」。
- 空：居中图标（`Sparkles`，`opacity 0.5`）+ 标题 + 一句引导。
- 错误：**必须有可见错误文案 + 出路**（重试/返回），禁止失败后停在加载态（见 `design.md` 配套的功能分析 P0-4）。

---

## 5. 动效规范（Framer Motion）

- **页面级**：`initial={{opacity:0, y:6–8}} → animate={{opacity:1,y:0}}`，`duration 0.25–0.35`，`ease [0.4,0,0.2,1]`，按 `location.pathname` 做 key。
- **列表入场**：`staggerContainer { staggerChildren: 0.08 }` + `childVariant { y: 12–16 → 0, duration 0.35–0.4 }`。
- **滚动入场**：`whileInView` + `viewport={{ once: true, margin: '-60px' }}`。
- **CSS 关键帧**（global.css 已备）：`fadeInUp / fadeIn / slideInLeft / pulse / shimmer / spin`，配 `.animate-*` 与 `.stagger-children` 工具类。
- **时长上限**：单个入场 ≤ 0.6s；交互态 = `--duration`（0.2s）。

---

## 6. 样式架构约定

**两层结构，新增代码必须遵守：**

1. **全局层** `global.css`——只放：design token、`.btn/.card/.input/.label/.container` 等**跨页复用原语**、app-shell/sidebar/public-header 骨架、动画关键帧。
2. **页面层**——每个页面/组件用**内联 `<style>{}` + 语义化 class 前缀**自管样式，前缀和文件一一对应：

| 前缀 | 归属 |
|------|------|
| `cw-` | ChatWorkspace |
| `chem-` | 化学知识列表/详情 |
| `detail-` | 知识详情页 |
| `training-` | 专题训练 |
| `auth-` | 登录/注册 |
| `settings-` | 设置 |
| `about-` | 关于 |
| `hero-` / `mock-` / `module-` / `feature-` | 落地页 |

> 约定：**能用 token 就别写死值；能复用 `.btn/.card/.input` 就别另起炉灶**。新前缀需在本表登记。

---

## 7. 新增 UI 检查清单（提交前自检）

- [ ] 颜色全部来自 token，无硬编码十六进制（语义色除外）。
- [ ] 主色只用于交互/选中/强调，正文为中性灰黑。
- [ ] 圆角/阴影/间距取自既有刻度。
- [ ] 复用了 `.btn` `.card` `.input`，未重复造轮子。
- [ ] 图标来自 lucide-react，size/strokeWidth 合规。
- [ ] 加载 / 空 / 错误三态齐全，错误态有出路。
- [ ] 入场动效符合 §5（时长、缓动、stagger）。
- [ ] 375 / 768 / 1280px 三档无横向滚动，移动端抽屉/单栏正常。
- [ ] 新 class 前缀已在 §6 登记。
- [ ] 文案为简体中文、口吻克制（面向高中生，不卖弄）。

---

## 8. 反面清单（禁止出现）

- ❌ 紫色渐变铺底、彩虹色、霓虹色等「通用 AI 风」。
- ❌ 一屏多个主按钮抢焦点。
- ❌ 深黑硬阴影、粗边框堆叠。
- ❌ 视差滚动、自动播放视频/轮播、夸张回弹动画。
- ❌ 引入 Inter/Roboto 等额外 web 字体（坚持系统字体栈）。
- ❌ 失败后无限转圈、无错误提示。
- ❌ 在页面里写死颜色/圆角而绕过 token。

---

## 9. 修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-06-11 | 基于现有实现首次沉淀设计规范 |
