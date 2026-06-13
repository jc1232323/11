# 模拟考试功能实现计划

## 概述

在左侧栏加一个"模拟考试"入口，功能包括：
1. 使用历年真题（化学卷子）生成模拟试卷
2. 限时考试，倒计时功能
3. 用户提交后自动评分 + 考后分析报告

## 实现方案

### 后端（NestJS）

#### 1. 新建实体

**`apps/api/src/entities/exam.entity.ts`** - 试卷模板
- id, examId (唯一标识如 `gaokao-2024`), title, duration (分钟), totalScore, questionIds (JSON数组引用 training_questions), createdAt

**`apps/api/src/entities/exam-attempt.entity.ts`** - 用户作答记录
- id, examId, userId, answers (JSON: {questionId: userAnswer}), score, totalScore, startedAt, submittedAt, report (JSON: 分析结果)

#### 2. 新建模块 `apps/api/src/exam/`

**exam.module.ts** - 注册实体、controller、service

**exam.service.ts**:
- `listExams()` - 获取所有试卷列表
- `getExam(examId)` - 获取试卷详情（含题目）
- `startAttempt(userId, examId)` - 开始考试，记录 startedAt
- `submitAttempt(attemptId, userId, answers)` - 提交答案、自动评分、生成报告
- `getAttempt(attemptId, userId)` - 获取某次考试记录（含报告）
- `listMyAttempts(userId)` - 获取用户历史考试记录

**exam.controller.ts**:
- `GET /exam/papers` - 试卷列表
- `GET /exam/papers/:examId` - 试卷详情
- `POST /exam/start` - 开始考试
- `POST /exam/submit` - 提交试卷
- `GET /exam/attempts` - 我的考试记录
- `GET /exam/attempts/:attemptId` - 单次考试详情与报告

**评分逻辑**（在 service 中）:
- 单选题：答案完全匹配得分
- 填空题/综合题：关键词匹配 + 简单相似度判断
- 每题计分后汇总

**报告生成**:
- 总分/得分率
- 各知识点得分分析
- 薄弱环节提示
- 用时分析

#### 3. 注册到 AppModule

在 `app.module.ts` 中导入 ExamModule，entities 列表中加入新实体。

### 前端（React）

#### 4. 侧边栏添加入口

在 `Layout.tsx` 的 `sidebarNav` 数组中插入：
```
{ to: '/exam', label: '模拟考试', icon: FileCheck }
```
位置放在"专题训练"后面。

#### 5. 新建页面

**`apps/web/src/pages/ExamListPage.tsx`** - 试卷列表页
- 展示所有可用试卷（年份、题量、时间限制）
- 显示历史成绩
- 点击"开始考试"进入考试

**`apps/web/src/pages/ExamPage.tsx`** - 考试进行页
- 顶部固定倒计时条
- 题目列表，支持选择/填写答案
- 题号导航栏（快速跳转）
- 交卷按钮（倒计时结束自动提交）
- 退出确认弹窗

**`apps/web/src/pages/ExamReportPage.tsx`** - 考后报告页
- 分数展示（总分、百分比、等级）
- 各题对错一览
- 知识点雷达图/柱状图
- 薄弱环节分析
- 错题回顾（含正确答案和解析）

#### 6. 路由注册

在 `App.tsx` 中添加：
- `/exam` → ExamListPage
- `/exam/:examId` → ExamPage
- `/exam/report/:attemptId` → ExamReportPage

### 数据种子

#### 7. 新建种子脚本 `scripts/seed-exams.ts`

从现有 training_questions 中按真题来源组卷：
- 模拟卷1: 高考真题选择题 20道 + 综合题 4道，限时 45 分钟
- 模拟卷2: 有机化学专项，15题，限时 30 分钟
- 可扩展更多

## 文件变更清单

### 新建文件
1. `apps/api/src/entities/exam.entity.ts`
2. `apps/api/src/entities/exam-attempt.entity.ts`
3. `apps/api/src/exam/exam.module.ts`
4. `apps/api/src/exam/exam.controller.ts`
5. `apps/api/src/exam/exam.service.ts`
6. `apps/web/src/pages/ExamListPage.tsx`
7. `apps/web/src/pages/ExamPage.tsx`
8. `apps/web/src/pages/ExamReportPage.tsx`
9. `scripts/seed-exams.ts`

### 修改文件
1. `apps/api/src/app.module.ts` - 导入 ExamModule + 实体
2. `apps/web/src/components/Layout.tsx` - 侧边栏加入口
3. `apps/web/src/App.tsx` - 添加路由
