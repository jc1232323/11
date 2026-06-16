---
name: deploy-chem-qa-single-image
description: Use when deploying this chem-qa project as a single Docker image to the glowxq Aliyun ACR/server stack, publishing jc.glowxq.com-style nginx routes, or repeating the SQLite single-container deployment workflow.
---

# Deploy chem-qa Single Image

Use this for this repo's production-style deployment: build the single-container app image, push to Aliyun ACR, run it on the remote Docker host, update nginx-ui nginx config, verify HTTPS, and write a deploy note.

## Required Inputs

- Repo root: current project.
- Deployment defaults: `/Users/glowxq/Documents/code/glowxq/tool/nginx-admin/remote-defaults.sh`
- Nginx baseline: `/Users/glowxq/Documents/code/glowxq/tool/nginx-admin/nginx-host.conf`
- Nginx procedure: `/Users/glowxq/Documents/code/glowxq/tool/nginx-admin/nginx-config-guide.md`

Never copy secrets from `remote-defaults.sh` into skill files or deploy docs. Source them only in shell sessions.

## Known Target Pattern

- ACR: `registry.cn-guangzhou.aliyuncs.com/glowxq/app:<tag>`
- Server config dir: `/my/nginx-ui/data/nginx`
- Nginx container: `nginx-ui-server`
- Certificate for `*.glowxq.com`: `/my/ssl/glowxq.com/cert.pem` and `/my/ssl/glowxq.com/cert.key`
- chem-qa app container: `chem-qa`
- chem-qa data volume: `chem_qa_data`
- SQLite DB in container: `/data/chem-qa.sqlite`
- Preferred public access: nginx HTTPS -> `127.0.0.1:<host-port>` -> container `80`
- Test accounts must work after deploy: `vip@test.com`, `vie@test.com`, and `free@test.com` all use password `test123456`.

Use these shell variables for examples unless the user specifies different values:

```bash
APP_NAME=chem-qa
CONTAINER_NAME=chem-qa
DOMAIN=jc.glowxq.com
HOST_PORT=8170
DATA_VOLUME=chem_qa_data
```

## Workflow

1. Inspect current state.
   - Read the three required input files.
   - Check `git status --short`; do not revert unrelated user changes.
   - Confirm server architecture and free port:
     ```bash
     set -a; source /Users/glowxq/Documents/code/glowxq/tool/nginx-admin/remote-defaults.sh; set +a
     HOST_PORT=8170
     SSHPASS="$SERVER_PASS" sshpass -e ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
       "uname -m; docker ps --format '{{.Names}} {{.Ports}}'; ss -tlnp | grep -E ':${HOST_PORT}\\b' || true"
     ```

2. Build the image locally.
   - This Dockerfile packages existing local build outputs and `node_modules` to avoid Docker-build npm network failures.
   - Always build app artifacts first:
     ```bash
     npm install
     npm run build
     docker build --platform=linux/amd64 --pull=false -t chem-qa:single .
     ```
   - If `rollup-linux-x64-gnu`, `sqlite3`, `bcrypt`, or `node-gyp` errors appear, check whether Docker is trying to build inside Linux from macOS dependencies. This repo intentionally uses `sql.js` and `bcryptjs` to avoid native runtime modules.

3. Push to Aliyun ACR.
   ```bash
   set -a; source /Users/glowxq/Documents/code/glowxq/tool/nginx-admin/remote-defaults.sh; set +a
   APP_NAME=chem-qa
   TAG="${APP_NAME}-$(date +%Y%m%d-%H%M)"
   IMAGE_FULL="${REGISTRY}/glowxq/app:${TAG}"
   IMAGE_LATEST="${REGISTRY}/glowxq/app:${APP_NAME}-latest"
   printf '%s' "$ACR_PASS" | docker login "$REGISTRY" -u "$ACR_USER" --password-stdin
   docker tag chem-qa:single "$IMAGE_FULL"
   docker tag chem-qa:single "$IMAGE_LATEST"
   docker push "$IMAGE_FULL"
   docker push "$IMAGE_LATEST"
   ```

4. Run on the server.
   - Bind to loopback only; nginx is the public entry.
   - Set `CLIENT_URL` to the final HTTPS domain.
   ```bash
   set -a; source /Users/glowxq/Documents/code/glowxq/tool/nginx-admin/remote-defaults.sh; set +a
   APP_NAME=chem-qa
   DOMAIN=jc.glowxq.com
   HOST_PORT=8170
   CONTAINER_NAME=chem-qa
   DATA_VOLUME=chem_qa_data
   IMAGE_FULL="${IMAGE_FULL:-${REGISTRY}/glowxq/app:${APP_NAME}-latest}"
   export SSHPASS="$SERVER_PASS"
   sshpass -e ssh "$SERVER_USER@$SERVER_HOST" "
   set -e
   printf '%s' '$ACR_PASS' | docker login '$REGISTRY' -u '$ACR_USER' --password-stdin
   docker pull '$IMAGE_FULL'
   docker rm -f '$CONTAINER_NAME' >/dev/null 2>&1 || true
   docker volume create '$DATA_VOLUME' >/dev/null
   docker run -d \
     --name '$CONTAINER_NAME' \
     --restart unless-stopped \
     -p 127.0.0.1:'$HOST_PORT':80 \
     -v '$DATA_VOLUME':/data \
     -e CLIENT_URL=https://'$DOMAIN' \
     '$IMAGE_FULL'
   sleep 6
   docker ps --filter name='$CONTAINER_NAME' --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}'
   docker logs --tail=80 '$CONTAINER_NAME' | grep -E '\\[init-accounts\\]|API running|\\[entrypoint\\]' || true
   curl -sS -o /tmp/chem-qa-index.html -w 'local_http=%{http_code} bytes=%{size_download}\n' http://127.0.0.1:'$HOST_PORT'/
   "
   ```

5. Update nginx baseline and publish safely.
   - Add a server block to `nginx-host.conf` next to the related `case.glowxq.com` block.
   - Reuse `/my/ssl/glowxq.com/cert.pem` and `cert.key` for any `*.glowxq.com` subdomain.
   - Include `/health` returning a plain-text upstream marker.
   - Upload as `/my/nginx-ui/data/nginx/nginx-new.conf`, test candidate, backup live config, copy over, test live config, reload:
     ```bash
     set -a; source /Users/glowxq/Documents/code/glowxq/tool/nginx-admin/remote-defaults.sh; set +a
     export SSHPASS="$SERVER_PASS"
     NGINX_LOCAL=/Users/glowxq/Documents/code/glowxq/tool/nginx-admin/nginx-host.conf
     sshpass -e scp "$NGINX_LOCAL" "$SERVER_USER@$SERVER_HOST:/my/nginx-ui/data/nginx/nginx-new.conf"
     sshpass -e ssh "$SERVER_USER@$SERVER_HOST" '
     set -e
     docker exec nginx-ui-server nginx -t -c /etc/nginx/nginx-new.conf
     backup=/my/nginx-ui/data/nginx/nginx.conf.bak-$(date +%Y%m%d-%H%M%S)
     cp /my/nginx-ui/data/nginx/nginx.conf "$backup"
     cp /my/nginx-ui/data/nginx/nginx-new.conf /my/nginx-ui/data/nginx/nginx.conf
     docker exec nginx-ui-server nginx -t
     docker exec nginx-ui-server nginx -s reload
     echo "backup=$backup"
     '
     ```

6. Verify before claiming deployment is done.
   Required checks:
   ```bash
   DOMAIN=jc.glowxq.com
   curl -sS -o /tmp/jc-health.txt -w 'health=%{http_code}\n' "https://${DOMAIN}/health"
   curl -sS -o /tmp/jc-index.html -w 'home=%{http_code} bytes=%{size_download}\n' "https://${DOMAIN}/"
   curl -sS -o /tmp/jc-llm.json -w 'api=%{http_code}\n' "https://${DOMAIN}/api/llm/health"
   for email in vip@test.com vie@test.com free@test.com; do
     curl -sS -o "/tmp/jc-login-${email}.json" -w "${email} login=%{http_code}\n" \
       -H 'Content-Type: application/json' \
       -d "{\"email\":\"${email}\",\"password\":\"test123456\"}" \
       "https://${DOMAIN}/api/auth/login"
   done
   echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -subject -dates
   ```
   `api/llm/health` may return HTTP 200 with `{"ok":false,"message":"HTTP 402：Insufficient Balance"}`. Treat that as app/proxy reachable but upstream LLM billing unavailable.

7. Write deploy documentation.
   - Save a concise record under `deploy/`, e.g. `deploy/chem-qa-deployment.md`.
   - Include image tags, container name, port, volume, nginx backup path, verification outputs, redeploy and rollback commands.
   - Do not include passwords or SMTP authorization codes.

## Common Pitfalls

- Docker Hub metadata pulls can fail with EOF. Use `--pull=false` when a local base image is available.
- Docker build-time npm can fail with `ECONNRESET`; this repo's Dockerfile avoids npm in Docker by packaging local dependencies and local `dist` outputs.
- macOS `node_modules` can contain Darwin Rollup/esbuild optional packages. Do not run `npm run build` inside a Linux image using copied macOS dependencies.
- Native modules (`sqlite3`, `bcrypt`) cause `node-gyp`/headers failures. This deployment uses `sql.js` and `bcryptjs`.
- A 200 homepage is not enough. Always verify seeded login accounts; `vie@test.com` is kept as a compatibility alias for the common `vip@test.com` typo.
- Never overwrite nginx live config until `nginx -t -c /etc/nginx/nginx-new.conf` passes.
- Bind app containers to `127.0.0.1` unless direct public access is intentional.
- Always set `CLIENT_URL` to the final HTTPS domain on the server.
