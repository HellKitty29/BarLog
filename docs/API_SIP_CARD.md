# 酒卡图片与详情 API（v20260530）

Base URL：与前端 `EXPO_PUBLIC_API_BASE_URL` 一致（当前演示环境为 Cloudflare Tunnel HTTPS 同域）

**认证：** 除 `/health` 外均需 `Authorization: Bearer <accessToken>`

**静态资源：** 上传成功后返回相对路径（如 `/uploads/photos/xxx.jpg`），浏览器访问时需拼当前站点 origin，或由 Nginx 反代 `/uploads/` 到后端。

---

## 1. 当前保存机制说明

发布 Sip 打卡时，前端应 **先上传图片、再创建打卡**：

| 步骤 | 接口 | 存储位置 | 写入字段 |
|------|------|----------|----------|
| 1 | `POST /api/uploads/image` | `uploads/photos/` | 打卡请求的 `photoUrl`（原始酒照） |
| 2 | `POST /api/uploads/card` | `uploads/cards/` | 打卡请求的 `cardImageUrl`（酒卡图） |
| 3 | `POST /api/checkins` | 数据库 `check_ins` | 同时保存 `photo_url`、`card_image_url` 及酒名、酒吧、可见性等 |

**注意：**

- 旧版 `/api/uploads/image` 曾返回 stub 假 URL（`images.barlog.local`），**现已改为真实落盘**。
- 若创建打卡时未传 `cardImageUrl`，后端会将 `card_image_url` **回退为 `photoUrl`**，但推荐前端显式上传酒卡图。
- `visibility` 为 `private` 时仅本人 Diary 可见；`public` / `tonight_only` 且未过期时出现在社区 Feed。

---

## 2. 上传接口（本版修复/新增）

### 2.1 上传原始酒照

`POST /api/uploads/image`

- Content-Type：`multipart/form-data`
- 字段：`file`（jpg/png/webp/gif，最大 10MB）

**响应 200：**

```json
{
  "imageUrl": "/uploads/photos/3f2a1b4c-....jpg",
  "width": 1200,
  "height": 1600,
  "mimeType": "image/jpeg"
}
```

### 2.2 上传酒卡图片（新增）

`POST /api/uploads/card`

- 与 2.1 相同，文件存入 `uploads/cards/`
- 响应形状与 2.1 一致，`imageUrl` 形如 `/uploads/cards/....jpg`

---

## 3. 创建打卡（含图片字段）

`POST /api/checkins`

**请求 body 示例：**

```json
{
  "photoUrl": "/uploads/photos/3f2a1b4c-....jpg",
  "cardImageUrl": "/uploads/cards/8d1e0f2a-....jpg",
  "drinkName": "Smoked Negroni",
  "drinkCategory": "cocktail",
  "barName": "Amber Room",
  "city": "Shanghai",
  "moodTags": ["warm", "bitter"],
  "rating": 4.5,
  "vibeMumbling": "Orange peel, low lights.",
  "cardStyle": "receipt",
  "visibility": "tonight_only",
  "socialStatus": "not_social"
}
```

**响应 201：** 与现有 `FrontendCheckInVO` 相同，含 `photoUrl`、`cardImageUrl`。

---

## 4. 酒卡详情（新增）

用于社区 Feed / Diary 点击某条打卡后展示完整酒卡与图片。

`GET /api/sip-cards/{checkInId}`

### 读权限

| 场景 | 是否可读 |
|------|----------|
| 本人任意 visibility | 是 |
| 他人 `public` / `tonight_only` 且未过期 | 是 |
| 他人 `private` | 否 → 403 `CHECKIN_FORBIDDEN` |
| 他人已过期公开帖 | 否 → 404 |

### 响应 200 示例

```json
{
  "id": "9017518d83e0fc82150a727b12c218ca",
  "userId": "0702459d6d0810cec123963beb02339d",
  "author": {
    "id": "0702459d6d0810cec123963beb02339d",
    "displayName": "Mina Chen",
    "avatarUrl": null
  },
  "photoUrl": "/uploads/photos/3f2a1b4c-....jpg",
  "cardImageUrl": "/uploads/cards/8d1e0f2a-....jpg",
  "drinkName": "Smoked Negroni",
  "drinkCategory": "cocktail",
  "barId": "bar_001",
  "barName": "Amber Room",
  "city": "Shanghai",
  "area": "Jing'an",
  "moodTags": ["warm", "bitter"],
  "rating": 4.5,
  "vibeMumbling": "Orange peel, low lights.",
  "cardStyle": "receipt",
  "visibility": "tonight_only",
  "socialStatus": "not_social",
  "createdAt": "2026-05-30T09:00:00Z",
  "expiresAt": "2026-05-31T09:00:00Z",
  "likedCount": 3,
  "commentCount": 1,
  "likedByMe": false,
  "owner": true
}
```

### 字段说明

| 字段 | 说明 |
|------|------|
| `photoUrl` | 原始酒照 URL |
| `cardImageUrl` | 酒卡图 URL；若库中为空则回退为 `photoUrl` |
| `author` | 发布者昵称/头像 |
| `likedCount` / `commentCount` / `likedByMe` | 社区互动统计（私密帖也可返回，通常为 0） |
| `owner` | 当前登录用户是否为作者 |

### 与旧接口关系

| 接口 | 用途 |
|------|------|
| `GET /api/checkins/{id}` | 仍可用，字段较少，**无** `author`、互动统计 |
| `GET /api/sip-cards/{id}` | **推荐**用于酒卡详情页 |

---

## 5. 列表接口中的图片

| 接口 | 图片字段 | 说明 |
|------|----------|------|
| `GET /api/checkins/recent` | `photoUrl`, `cardImageUrl` | Diary 列表 |
| `GET /api/gallery/feed` | `imageUrl` | 社区缩略图，优先 `cardImageUrl`，否则 `photoUrl` |

---

## 6. Nginx 反代要求

同域部署时需反代：

- `/api/` → 后端 API
- `/uploads/` → 后端静态文件（Spring `WebConfig` 映射）

示例见 `scripts/deploy/nginx-app-dev-tunnel.conf`。

---

## 9. 相关文档

- Match 一对一聊天：见 [API_MATCH_CHAT.md](./API_MATCH_CHAT.md)

---

## 10. 常见错误

| HTTP | code | 含义 |
|------|------|------|
| 401 | `AUTH_REQUIRED` | 未登录 |
| 403 | `CHECKIN_FORBIDDEN` | 无权查看他人私密酒卡 |
| 404 | — | 酒卡不存在或已过期 |

---

## 8. 前端代码位置

| 模块 | 路径 |
|------|------|
| 上传 | `src/features/upload/upload.api.ts` |
| 创建打卡 | `src/features/sip/sip.api.ts` |
| 酒卡详情 | `src/features/sip/sip-card.api.ts` |
| 媒体 URL | `src/services/media/resolve-media-url.ts` |
| endpoints | `src/services/api/endpoints.ts` |
