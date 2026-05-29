# BarLog 前端 Web 快速部署（跨域方案）

前端静态站：**Nginx :80**  
后端 API：**Docker :8080**（不变）  
前端 **不改代码**，构建时 API 仍为 `http://54.251.141.226:8080`，靠 **CORS** 跨域。

---

## 架构

```text
浏览器 → http://54.251.141.226/          (Nginx 静态 dist/)
       → http://54.251.141.226:8080/api/  (spring-api，带 JWT)
```

---

## 一、本机（Windows）

```powershell
cd D:\cursor\alcohol\BarLog-main\BarLog-main

# 1. 生产环境变量（首次）
copy .env.production.example .env.production

# 2. 构建（Expo 54 无 --env-file，用 .env.production + NODE_ENV=production）
powershell -File scripts/deploy/build-web.ps1
# 或：$env:NODE_ENV="production"; npx expo export --platform web

# 3. 上传
powershell -File scripts/deploy/upload-web.ps1
```

---

## 二、服务器（SSH，每次发版 + 首次安装）

### 首次：Nginx + 目录

```bash
# 上传 nginx 配置（本机执行一次）
scp -i "D:\AWS\testkey.pem" scripts/deploy/nginx-app-dev.conf.example ec2-user@54.251.141.226:/tmp/nginx-app-dev.conf

# SSH 登录后
sudo bash /path/to/server-install-web.sh /tmp/nginx-app-dev.conf
# 或手动：
sudo mkdir -p /var/www/barlog-app-dev
sudo cp /tmp/nginx-app-dev.conf /etc/nginx/conf.d/barlog-app-dev.conf
sudo nginx -t && sudo systemctl enable nginx && sudo systemctl reload nginx
```

确认 **安全组 / 防火墙放行 80**。

### 每次发版：同步静态文件

```bash
sudo mkdir -p /var/www/barlog-app-dev
sudo rsync -av --delete /tmp/barlog-web/ /var/www/barlog-app-dev/
sudo chown -R nginx:nginx /var/www/barlog-app-dev
sudo nginx -t && sudo systemctl reload nginx
```

### 必须：后端 CORS

编辑 `/opt/alcohol-api/secrets/dev.env`，`CORS_ALLOWED_ORIGINS` 包含页面来源：

```bash
CORS_ALLOWED_ORIGINS=http://54.251.141.226,http://localhost:8081,http://127.0.0.1:8081
```

重建 API 容器：

```bash
sudo docker stop spring-api && sudo docker rm spring-api
sudo docker run -d --name spring-api --restart unless-stopped \
  --env-file /opt/alcohol-api/secrets/dev.env \
  -p 8080:8090 \
  -v /opt/app/backend/app:/app:rw \
  --network backend_default \
  eclipse-temurin:17-jdk \
  java -jar /app/app.jar
```

---

## 三、验证

| 检查 | 命令/操作 |
|------|-----------|
| 静态站 | 浏览器打开 `http://54.251.141.226/` |
| API | `curl -s http://54.251.141.226:8080/health` |
| CORS | 登录后 F12 Network 无 CORS 红字 |
| 401 | 未登录调 API 应 401（匿名已关） |

---

## 四、本地开发（不变）

```powershell
npm install
npm run start
# .env.development 指向 http://54.251.141.226:8080 或本地 API
```

---

## 五、以后上 HTTPS / 域名

1. Cloudflare：`app-dev.barlog.app` → A 记录  
2. Nginx 加 443 + Origin 证书  
3. `.env.production` 可仍用 `https://api-dev.barlog.app` 或同域反代（需改构建配置）  
4. CORS 增加 `https://app-dev.barlog.app`
