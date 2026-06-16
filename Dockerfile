FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
  DATABASE_TYPE=sqlite \
  DATABASE_PATH=/data/chem-qa.sqlite \
  API_PORT=3001 \
  PORT=80 \
  CLIENT_URL=http://localhost:8080 \
  INIT_CONTENT=missing \
  SERVE_STATIC_ROOT=/app/apps/web/dist

COPY node_modules ./node_modules
COPY apps/api/dist ./apps/api/dist
COPY apps/web/dist ./apps/web/dist
COPY content ./content
COPY .env ./.env
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p /data \
  && chown -R node:node /app /data

EXPOSE 80
VOLUME ["/data"]

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "apps/api/dist/main.js"]
