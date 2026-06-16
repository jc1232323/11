# chem-qa 部署记录

部署日期：2026-06-16  
访问域名：<https://jc.glowxq.com>  
服务器：`182.43.106.206`  

## 镜像

固定版本镜像：

```text
registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-20260616-1133
```

latest 镜像：

```text
registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-latest
```

本次服务器实际运行固定版本镜像，避免 latest 漂移：

```text
registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-20260616-1133
```

## 容器

容器名：

```text
chem-qa
```

端口：

```text
127.0.0.1:8170 -> container:80
```

数据卷：

```text
chem_qa_data -> /data
```

SQLite 数据库：

```text
/data/chem-qa.sqlite
```

运行参数：

```bash
docker run -d \
  --name chem-qa \
  --restart unless-stopped \
  -p 127.0.0.1:8170:80 \
  -v chem_qa_data:/data \
  -e CLIENT_URL=https://jc.glowxq.com \
  registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-20260616-1133
```

初始化策略：

```text
INIT_CONTENT=missing
```

启动时如果 `knowledge_nodes` 已有数据则跳过导入；空库会自动初始化知识点。

## Nginx

Nginx 容器：

```text
nginx-ui-server
```

服务器配置目录：

```text
/my/nginx-ui/data/nginx
```

线上配置：

```text
/my/nginx-ui/data/nginx/nginx.conf
```

本次备份：

```text
/my/nginx-ui/data/nginx/nginx.conf.bak-20260616-033618
```

新增站点：

```nginx
server {
    server_name jc.glowxq.com;
    listen 443 ssl;
    http2 on;
    ssl_certificate /my/ssl/glowxq.com/cert.pem;
    ssl_certificate_key /my/ssl/glowxq.com/cert.key;

    location / {
        proxy_pass http://127.0.0.1:8170/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 900s;
        proxy_send_timeout 900s;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
        proxy_next_upstream_timeout 10s;
    }

    location /health {
        access_log off;
        return 200 "healthy jc.glowxq.com->8170\n";
        add_header Content-Type text/plain;
    }
}
```

证书复用：

```text
/my/ssl/glowxq.com/cert.pem
/my/ssl/glowxq.com/cert.key
```

证书信息：

```text
CN=*.glowxq.com
notBefore=Apr  8 12:27:52 2026 GMT
notAfter=Jul  7 12:27:51 2026 GMT
SAN=DNS:*.glowxq.com, DNS:glowxq.com
```

## 验证结果

本地服务验证：

```text
http://127.0.0.1:8170/ -> 200
```

公网 HTTPS 验证：

```text
https://jc.glowxq.com/health -> 200
https://jc.glowxq.com/ -> 200
https://jc.glowxq.com/api/llm/health -> 200
```

LLM 健康接口响应：

```json
{"ok":false,"message":"HTTP 402：Insufficient Balance"}
```

这表示应用链路正常，上游 DeepSeek 账号余额不足。

服务器运行状态：

```text
container=chem-qa
image=registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-20260616-1133
restart=unless-stopped
ports=127.0.0.1:8170->80
memory≈62.87MiB
```

## 常用命令

查看容器：

```bash
docker ps --filter name=chem-qa
docker logs --tail=100 chem-qa
docker stats chem-qa --no-stream
```

重启容器：

```bash
docker restart chem-qa
```

重新部署固定版本：

```bash
docker pull registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-20260616-1133
docker rm -f chem-qa
docker volume create chem_qa_data
docker run -d \
  --name chem-qa \
  --restart unless-stopped \
  -p 127.0.0.1:8170:80 \
  -v chem_qa_data:/data \
  -e CLIENT_URL=https://jc.glowxq.com \
  registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-20260616-1133
```

测试并重载 Nginx：

```bash
docker exec nginx-ui-server nginx -t
docker exec nginx-ui-server nginx -s reload
```

回滚 Nginx：

```bash
cp /my/nginx-ui/data/nginx/nginx.conf.bak-20260616-033618 \
  /my/nginx-ui/data/nginx/nginx.conf
docker exec nginx-ui-server nginx -t
docker exec nginx-ui-server nginx -s reload
```

## 构建说明

本镜像为单容器应用，内置：

```text
NestJS API
React 静态文件
SQLite 文件数据库初始化逻辑
```

构建前需在本地生成构建产物：

```bash
npm install
npm run build
docker build --platform=linux/amd64 --pull=false -t chem-qa:single .
```

推送镜像：

```bash
docker tag chem-qa:single registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-20260616-1133
docker tag chem-qa:single registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-latest
docker push registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-20260616-1133
docker push registry.cn-guangzhou.aliyuncs.com/glowxq/app:chem-qa-latest
```
