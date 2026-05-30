# Match 一对一聊天 API（v20260530）

Base URL：与前端 `EXPO_PUBLIC_API_BASE_URL` 一致

**认证：** 除 `/health`、`/uploads/**`、`/api/media/**` 外均需 `Authorization: Bearer <accessToken>`

本版在 [API_SIP_CARD.md](./API_SIP_CARD.md) 基础上，补充 **Match 真实用户列表**、**建立 1:1 会话**、**聊天消息** 接口。

---

## 1. Match：真实用户列表

`GET /api/match/candidates`

返回数据库中 **除当前用户外** 的注册用户（最多 50 个），用于 Discover → Match 页。

**响应 200：**

```json
[
  {
    "id": "6fb413b78566352f94fde4fae9030fc1",
    "displayName": "小野",
    "avatarUrl": "/api/media/avatar/6fb413b78566352f94fde4fae9030fc1",
    "reason": "Checked in with Negroni tonight.",
    "distanceMeters": null,
    "hasTodayCheckIn": true
  }
]
```

| 字段 | 说明 |
|------|------|
| `avatarUrl` | 无头像时返回 `/api/media/avatar/{userId}` SVG 占位 |
| `reason` | 优先取最新公开打卡 `vibeMumbling`，否则 bio / 默认文案 |
| `hasTodayCheckIn` | 对方今日是否已打卡 |

> 旧版 mock（Alex Wu / Rin Zhao）已移除。

---

## 2. Match：建立 1:1 聊天

`POST /api/match/connect`

点击 Match 页用户头像/卡片时调用，创建或复用两人之间的 direct 会话。

**请求 body：**

```json
{
  "userId": "6fb413b78566352f94fde4fae9030fc1"
}
```

**响应 200：**

```json
{
  "conversationId": "conv_xxx",
  "status": "ready",
  "peer": {
    "id": "6fb413b78566352f94fde4fae9030fc1",
    "displayName": "小野",
    "avatarUrl": "/api/media/avatar/6fb413b78566352f94fde4fae9030fc1"
  }
}
```

| 错误 | 说明 |
|------|------|
| 400 | 不能与自己聊天 |
| 404 | 用户不存在 |

会话类型为 `match`；若两人已有 direct/bar_wave/match 会话，则 **复用同一 conversationId**。

---

## 3. 聊天：会话列表

`GET /api/chat/conversations`

**响应 200：**

```json
{
  "items": [
    {
      "id": "conv_xxx",
      "title": "小野",
      "lastMessage": "Hey, want to share a bar?",
      "unreadCount": 0,
      "updatedAt": "2026-05-30T10:00:00Z",
      "peerUserId": "6fb413b78566352f94fde4fae9030fc1",
      "peerDisplayName": "小野",
      "peerAvatarUrl": "/api/media/avatar/6fb413b78566352f94fde4fae9030fc1"
    }
  ]
}
```

---

## 4. 聊天：消息列表

`GET /api/chat/conversations/{conversationId}/messages?cursor=&limit=`

**响应 200：**

```json
{
  "items": [
    {
      "id": "msg_xxx",
      "conversationId": "conv_xxx",
      "senderId": "0702459d6d0810cec123963beb02339d",
      "body": "Hi!",
      "createdAt": "2026-05-30T10:01:00Z"
    }
  ],
  "nextCursor": null
}
```

---

## 5. 聊天：发送消息

`POST /api/chat/conversations/{conversationId}/messages`

**请求 body：**

```json
{
  "body": "Hi, I'm at Amber Room too."
}
```

**响应 200：** 返回刚创建的消息对象（字段同列表 item）。

限制：1–2000 字符；仅会话成员可发。

---

## 6. 聊天：标记已读

`POST /api/chat/conversations/{conversationId}/read`

无 body。将会话未读数清零。

---

## 7. WebSocket（可选，后续 PWA 可接）

`ws://host/ws/chat?token=<accessToken>`

| 事件 | 说明 |
|------|------|
| `message.new` | 新消息推送 |
| `message.read` | 对端已读 |

当前 PWA 使用 HTTP 轮询（4s）拉取消息，WebSocket 可后续接入。

---

## 8. 社区酒卡图片占位（修复裂图）

demo 数据中的 `images.barlog.local` 无效 URL 会在 API 层改写为：

`GET /api/media/sip-card/{checkInId}` → SVG 酒卡占位（**公开，无需 JWT**）

用户头像占位：

`GET /api/media/avatar/{userId}` → SVG 首字母头像（**公开**）

真实上传图片仍走 `/uploads/photos/`、`/uploads/cards/`。

---

## 9. 前端代码位置

| 模块 | 路径 |
|------|------|
| Match 列表/连接 | `src/features/match/match.api.ts` |
| 聊天 | `src/features/chat/chat.api.ts` |
| Match + Chat UI | `src/web/App.tsx`（`MatchPanel` / `ChatSheet`） |
| 媒体 URL | `src/services/media/resolve-media-url.ts` |

---

## 10. 常见错误

| HTTP | code | 含义 |
|------|------|------|
| 401 | `AUTH_REQUIRED` | 未登录 |
| 404 | — | 会话不存在或非成员 |
