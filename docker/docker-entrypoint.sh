#!/usr/bin/env sh
set -eu

mkdir -p /data
chown -R node:node /data

export DATABASE_TYPE="${DATABASE_TYPE:-sqlite}"
export DATABASE_PATH="${DATABASE_PATH:-/data/chem-qa.sqlite}"
export API_PORT="${API_PORT:-3001}"
export PORT="${PORT:-80}"
export CLIENT_URL="${CLIENT_URL:-http://localhost:8080}"
export INIT_CONTENT="${INIT_CONTENT:-missing}"
export SERVE_STATIC_ROOT="${SERVE_STATIC_ROOT:-/app/apps/web/dist}"

echo "[entrypoint] database: ${DATABASE_TYPE} ${DATABASE_PATH}"
echo "[entrypoint] initializing database/content, INIT_CONTENT=${INIT_CONTENT}"
su node -s /bin/sh -c 'node apps/api/dist/init-content.js'

exec "$@"
