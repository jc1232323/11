# 化学知识问答学习站

面向全国高中生的化学知识点浏览 + AI 辅导问答（PRD v1.1）。

## 技术栈

- 前端：React + TypeScript + Vite + Framer Motion
- 后端：NestJS + TypeScript + TypeORM
- 数据库：MySQL 8（Docker）

## 快速开始

### 1. 环境要求

- Node.js 20+
- Docker Desktop（或 Docker Engine）

### 2. 安装依赖

```bash
cd "/Users/jc/知识问答"
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

`.env` 中默认已对齐下方 MySQL 账号。请配置 **你自己的** 大模型 Key：

```env
LLM_API_BASE=https://api.deepseek.com
LLM_API_KEY=sk-xxxxxxxx          # 填入你的 API Key
LLM_MODEL_NAME=deepseek-chat     # 或所用模型名
```

可按需修改 `JWT_SECRET`。

**常见 AI 报错「Authentication Fails / api key invalid」：**

1. `.env` 里仍是 `your-api-key-here` 或 `在这里粘贴…` 等占位文字 → 换成平台控制台复制的真实 Key  
2. **DeepSeek 的 Key** 必须配 `LLM_API_BASE=https://api.deepseek.com`，不能混用通义/OpenAI 的 Key  
3. 改完 `.env` 后必须 **重启** `npm run dev`（仅保存文件不会生效）  
4. 本地自检：浏览器打开 http://localhost:3001/api/llm/health ，应返回 `{ "ok": true }`

**端口被占用 `EADDRINUSE :::3001`：** 说明上一次的 API 还在跑。先执行 `npm run stop`，再 `npm run dev`；或直接再跑一次 `npm run dev`（已会自动清理 3001 端口）。

### 4. 启动 MySQL

```bash
npm run db:up
```

**开发环境 MySQL 密码（docker-compose 默认）：**

| 项 | 值 |
|----|-----|
| 端口 | `3307`（映射到容器 3306） |
| 数据库 | `chem_qa` |
| 用户 | `chem_user` |
| 密码 | `chem_pass_dev_2026` |
| root 密码 | `chem_root_dev_2026` |

### 5. 导入化学知识点

等待 MySQL 就绪后（约 10–20 秒）：

```bash
npm run import-content
```

### 6. 启动开发服务

```bash
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001/api

## 使用流程

1. 在 `.env` 中配置 `LLM_API_KEY` 等（仅服务端，用户不可见）
2. 注册账号（仅邮箱 + 密码，MVP 不支持找回密码）
3. 浏览 **化学知识**（物质的量、离子反应两章）
4. 在 **AI 问答** 中选择「思路直达」或「温柔老师」进行对话

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动 API + 前端（启动前会自动释放 3001 端口） |
| `npm run stop` | 停止占用 3001 / 5173 的旧进程 |
| `npm run dev:api` | 仅后端 |
| `npm run dev:web` | 仅前端 |
| `npm run import-content` | 从 `content/chemistry/` 导入知识点 |
| `npm run db:down` | 停止 MySQL 容器 |

## 项目结构

```
apps/api/          NestJS 后端
apps/web/          React 前端
content/chemistry/ Markdown 知识源 + meta.json
scripts/           import-content 导入脚本
```

## 内容维护

编辑 `content/chemistry/` 下 Markdown 与 `meta.json` 后，重新执行：

```bash
npm run import-content
```

> 注意：导入脚本会清空并重建 `knowledge_nodes` 表。

## 生产部署提示

- 将 `synchronize: true` 改为迁移方案
- 使用强随机 `JWT_SECRET`；`LLM_API_KEY` 勿提交到 Git
- 启用 HTTPS，Cookie `secure: true`
