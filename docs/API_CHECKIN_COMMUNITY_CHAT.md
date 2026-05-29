# 前端 API 速查：打卡 · 社区 · 聊天

Base URL：`EXPO_PUBLIC_API_BASE_URL`（如 `http://54.251.141.226:8080`）

**认证：** 除登录/注册/health 外，请求头必带 `Authorization: Bearer <accessToken>`

**附近酒吧响应：** `{ items: Bar[], source: "google_places"|"mock_fallback"|"google_places_error", message? }`

**社区额外规则：** 须**今日任意打卡**（不限城市/酒吧）才能解锁 Feed；Feed 为全球公开动态，不区分地区/酒吧；打卡 `visibility` 须为 `public` 或 `tonight_only` 才会出现在社区。

---

## 打卡 & 日记（仅本人）

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/checkins/recent` | 我的最近打卡 |
| POST | `/api/checkins` | 创建打卡 |
| GET | `/api/checkins/{id}` | 打卡详情（他人 private → 403） |
| DELETE | `/api/checkins/{id}` | 删除我的打卡 |
| GET | `/api/users/{userId}/checkins` | 我的历史（userId 须为本人） |
| GET | `/api/bars/{barId}/checkins` | 酒吧公开打卡（无 private） |
| GET | `/api/diary/summary?month=yyyy-MM` | 月度摘要 |
| GET | `/api/diary/calendar?month=yyyy-MM` | 日历打点 |
| GET | `/api/diary/stats` | 分类/心情统计 |

**创建打卡 body 要点：**

```json
{
  "photoUrl": "...",
  "drinkName": "...",
  "drinkCategory": "cocktail",
  "cardStyle": "receipt",
  "visibility": "private",
  "moodTags": []
}
```

| visibility | 谁能看 |
|------------|--------|
| `private` | 仅本人（日记） |
| `public` / `tonight_only` | 社区可见，24h 过期 |

---

## 社区

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/community/eligibility` | 今日是否已解锁社区 |
| GET | `/api/community/feed?range=24h&cursor=&limit=` | 全球帖子流（需今日打卡解锁） |
| POST | `/api/community/posts/{checkInId}/like` | 点赞/取消 |
| GET | `/api/community/posts/{checkInId}/comments` | 评论列表 |
| POST | `/api/community/posts/{checkInId}/comments` | 发评论 `{ "body": "..." }` |
| POST | `/api/community/users/{userId}/wave` | 打招呼开聊 `{ "checkInId?": "..." }` → `{ conversationId }` |

**规则：** 须今日任意打卡解锁社区；Feed 为全球公开动态，不区分城市/酒吧；仅含 public/tonight_only 且未过期打卡。

---

## 聊天

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/chat/conversations` | 会话列表 |
| GET | `/api/chat/conversations/{id}/messages?cursor=&limit=` | 消息列表 |
| POST | `/api/chat/conversations/{id}/messages` | 发消息 `{ "body": "..." }` |
| POST | `/api/chat/conversations/{id}/read` | 标记已读 |

**WebSocket：** `ws://host/ws/chat?token=<accessToken>`

| 事件 | 说明 |
|------|------|
| `message.new` | 新消息 |
| `message.read` | 已读 |

---

## 常见错误

| HTTP | code | 含义 |
|------|------|------|
| 401 | `AUTH_REQUIRED` | 未登录 |
| 403 | `CHECKIN_FORBIDDEN` | 无权读他人打卡 |
| 403 | `COMMUNITY_CHECKIN_REQUIRED` | 今日尚未打卡，社区未解锁 |

---

## 前端代码位置

| 模块 | 路径 |
|------|------|
| endpoints | `src/services/api/endpoints.ts` |
| 社区 | `src/features/community/community.api.ts` |
| 聊天 | `src/features/chat/chat.api.ts` |
| Token | `src/services/storage/token-storage.ts` |
