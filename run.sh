#!/usr/bin/env bash
#
# 一键运行 chem-qa（化学知识问答学习站）
#   流程：检查环境 → 安装依赖 → 准备 .env → 启动 MySQL → 等待就绪 → 导入知识点 → 启动前后端
#
# 用法：
#   ./run.sh                启动完整开发环境
#   ./run.sh --no-import    跳过知识点导入（数据已导入过时更快）
#   ./run.sh --no-db        跳过 MySQL 启动（已自行起好数据库时）
#   ./run.sh --help         查看帮助
#
set -euo pipefail

# 切到脚本所在目录，保证相对路径正确
cd "$(dirname "$0")"

# ---------- 输出辅助 ----------
c_reset='\033[0m'; c_blue='\033[34m'; c_green='\033[32m'; c_yellow='\033[33m'; c_red='\033[31m'
info()  { printf "${c_blue}▶ %s${c_reset}\n" "$*"; }
ok()    { printf "${c_green}✓ %s${c_reset}\n" "$*"; }
warn()  { printf "${c_yellow}! %s${c_reset}\n" "$*"; }
error() { printf "${c_red}✗ %s${c_reset}\n" "$*" >&2; }

# ---------- 参数解析 ----------
DO_IMPORT=1
DO_DB=1
for arg in "$@"; do
  case "$arg" in
    --no-import) DO_IMPORT=0 ;;
    --no-db)     DO_DB=0 ;;
    -h|--help)
      sed -n '3,10p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) error "未知参数：${arg}（使用 --help 查看用法）"; exit 1 ;;
  esac
done

# ---------- 1. 检查环境 ----------
info "检查运行环境"
command -v node >/dev/null 2>&1 || { error "未找到 node，请先安装 Node.js 20+"; exit 1; }
command -v npm  >/dev/null 2>&1 || { error "未找到 npm"; exit 1; }

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  error "Node.js 版本过低（当前 $(node -v)），需要 20+"; exit 1
fi
ok "Node.js $(node -v)"

# docker compose 命令（兼容新版 docker compose / 旧版 docker-compose）
DOCKER_COMPOSE=""
if [ "$DO_DB" -eq 1 ]; then
  if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
  else
    error "未找到 docker / docker compose，请安装 Docker Desktop，或用 --no-db 跳过"; exit 1
  fi
  docker info >/dev/null 2>&1 || { error "Docker 未运行，请先启动 Docker Desktop"; exit 1; }
  ok "Docker 就绪（$DOCKER_COMPOSE）"
fi

# ---------- 2. 准备 .env ----------
if [ ! -f .env ]; then
  info "未发现 .env，从 .env.example 复制一份"
  cp .env.example .env
  warn "请在 .env 中填入你自己的大模型 LLM_API_KEY（否则 AI 问答不可用）"
else
  ok ".env 已存在"
fi

# ---------- 3. 安装依赖 ----------
if [ ! -d node_modules ]; then
  info "安装依赖（首次较慢，请稍候）"
  npm install
  ok "依赖安装完成"
else
  ok "依赖已安装（如需重装可删除 node_modules）"
fi

# ---------- 4. 启动 MySQL ----------
if [ "$DO_DB" -eq 1 ]; then
  info "启动 MySQL 容器"
  $DOCKER_COMPOSE up -d

  info "等待 MySQL 就绪"
  ready=0
  for i in $(seq 1 60); do
    if $DOCKER_COMPOSE exec -T mysql mysqladmin ping -h 127.0.0.1 --silent >/dev/null 2>&1; then
      ready=1; break
    fi
    printf '.'; sleep 1
  done
  printf '\n'
  if [ "$ready" -ne 1 ]; then
    error "MySQL 在 60 秒内未就绪，请检查：$DOCKER_COMPOSE logs mysql"; exit 1
  fi
  ok "MySQL 就绪（localhost:3307）"
else
  warn "已跳过 MySQL 启动（--no-db）"
fi

# ---------- 5. 导入知识点 ----------
if [ "$DO_IMPORT" -eq 1 ]; then
  info "导入化学知识点（会重建 knowledge_nodes 表）"
  npm run import-content
  ok "知识点导入完成"
else
  warn "已跳过知识点导入（--no-import）"
fi

# ---------- 6. 启动前后端 ----------
info "启动开发服务（Ctrl+C 退出）"
echo "  - 前端：http://localhost:5173"
echo "  - 后端：http://localhost:3001/api"
exec npm run dev
