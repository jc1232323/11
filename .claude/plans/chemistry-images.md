# 化学知识点添加动画图片方案

## 思路

为每个知识点添加与内容匹配的可视化元素（SVG 动画 + 静态示意图），直接内嵌在 Markdown 中通过自定义 React 组件渲染。不依赖外部图片文件，加载快且可交互。

## 实现步骤

### 1. 创建化学动画组件库

新建 `apps/web/src/components/chemistry-illustrations/` 目录，包含：

- `ElectrolyteAnimation.tsx` — 电解质电离动画（离子在水中分离）
- `RedoxAnimation.tsx` — 氧化还原反应电子转移动画
- `MolConceptAnimation.tsx` — 粒子集合示意动画（6.02×10²³）
- `GasMolarVolumeAnimation.tsx` — 气体摩尔体积（22.4L气球膨胀）
- `ReactionRateAnimation.tsx` — 反应速率影响因素（粒子碰撞）
- `CollisionTheoryAnimation.tsx` — 碰撞理论动画
- `AtomStructureAnimation.tsx` — 原子结构（电子云轨道）
- `IonicCovalentBondAnimation.tsx` — 离子键/共价键形成
- `AlkanesAlkenesAnimation.tsx` — 烷烃取代/烯烃加成反应
- `PrecipitationAnimation.tsx` — 沉淀反应（离子聚集沉降）
- `EnthalpyAnimation.tsx` — 焓变能量图（放热/吸热）
- `index.ts` — 统一导出 + slug 映射

每个组件用 **Framer Motion**（已安装）+ 内联 SVG 实现动画，风格统一：
- 圆角容器，浅色背景
- 循环播放的示意动画
- 支持深色模式
- 移动端适配

### 2. 修改 MarkdownView 组件

在 `MarkdownView.tsx` 中增加对自定义标记的支持：
- 在 Markdown 中使用 `:::illustration slug-name` 语法
- 通过 remark 插件或在渲染前预处理，将其替换为对应的 React 动画组件

### 3. 更新 Markdown 内容

在每个知识点的 `.md` 文件中插入 `:::illustration xxx` 标记，位置放在正文概念描述之后。

### 4. 具体动画设计

| 知识点 | 动画内容 |
|--------|---------|
| 摩尔与阿伏伽德罗常数 | 粒子从散乱聚集成"1 mol"标签的集合 |
| 气体摩尔体积 | 气球膨胀到 22.4L，分子在内部运动 |
| 电解质与电离 | NaCl 晶体溶于水，Na⁺ Cl⁻ 分离扩散 |
| 沉淀反应 | 两种离子相遇形成沉淀下落 |
| 氧化还原反应 | 电子从还原剂转移到氧化剂 |
| 原子构成 | 电子绕核旋转，标注质子/中子/电子 |
| 离子键与共价键 | 电子转移（离子键）vs 电子共享（共价键）|
| 影响反应速率 | 粒子碰撞频率随温度/浓度变化 |
| 碰撞理论 | 有效碰撞 vs 无效碰撞对比 |
| 焓变 | 能量图从反应物到产物，标注 ΔH |
| 烷烃与烯烃 | 分子球棍模型 + 加成/取代反应过程 |
| 醇与酚 | 羟基官能团高亮 + 典型反应 |

### 5. 文件清单

**新增文件：**
- `apps/web/src/components/chemistry-illustrations/index.ts`
- `apps/web/src/components/chemistry-illustrations/IllustrationCard.tsx`（通用容器）
- 12 个动画组件文件
- 修改 `apps/web/src/components/MarkdownView.tsx`
- 修改 12 个 `content/chemistry/**/*.md` 文件

**不改动数据库，不改动后端**。所有动画都是前端组件，通过 Markdown 中的标记触发渲染。

### 6. 技术方案细节

```
Markdown 中写：
:::illustration electrolyte

MarkdownView 渲染前做预处理：
→ 识别 :::illustration xxx
→ 渲染对应的 <ElectrolyteAnimation /> 组件
```

优点：
- 零额外依赖（用现有 framer-motion）
- 不增加打包体积的图片资源
- SVG 动画矢量缩放，任何屏幕清晰
- 支持深色模式自动适配
- 后续容易扩展新动画
