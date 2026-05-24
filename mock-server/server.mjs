import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(readFileSync(join(__dirname, "db.json"), "utf8"));

function cloneSeed() {
  return JSON.parse(JSON.stringify(seed));
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function isAuthenticated(request) {
  const authorization = request.headers.authorization ?? "";
  return authorization === "Bearer mock-access-token";
}

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function monthMatches(dateString, month) {
  return !month || dateString.startsWith(month);
}

function createRouter(database) {
  return async function route(request, response) {
    const url = new URL(request.url ?? "/", "http://localhost");
    const path = url.pathname;
    const method = request.method ?? "GET";

    if (method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    try {
      if (method === "GET" && path === "/health") {
        sendJson(response, 200, { ok: true, service: "barlog-mock-backend" });
        return;
      }

      if (method === "POST" && path === "/api/auth/login") {
        const body = await readBody(request);
        const user = database.users.find(
          (item) => item.email === body.email && item.password === body.password
        );

        if (!user) {
          sendJson(response, 401, { message: "Invalid email or password", code: "AUTH_INVALID" });
          return;
        }

        sendJson(response, 200, {
          user: publicUser(user),
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token"
        });
        return;
      }

      if (method === "POST" && path === "/api/auth/register") {
        const body = await readBody(request);
        const user = {
          id: `user_${randomUUID()}`,
          displayName: body.displayName,
          email: body.email,
          password: body.password,
          city: "Shanghai",
          persona: "New barlog explorer"
        };
        database.users.push(user);
        sendJson(response, 201, {
          user: publicUser(user),
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token"
        });
        return;
      }

      if (method === "POST" && path === "/api/auth/logout") {
        sendJson(response, 200, {});
        return;
      }

      if (method === "POST" && path === "/api/auth/refresh") {
        sendJson(response, 200, {
          user: publicUser(database.users[0]),
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token"
        });
        return;
      }

      if (path.startsWith("/api/") && !isAuthenticated(request)) {
        sendJson(response, 401, { message: "Missing mock bearer token", code: "AUTH_REQUIRED" });
        return;
      }

      if (method === "GET" && path === "/api/auth/me") {
        sendJson(response, 200, publicUser(database.users[0]));
        return;
      }

      if (method === "POST" && path === "/api/uploads/image") {
        sendJson(response, 200, {
          imageUrl: `https://images.barlog.local/uploads/${randomUUID()}.jpg`,
          width: 1200,
          height: 1600,
          mimeType: "image/jpeg"
        });
        return;
      }

      if (method === "GET" && path === "/api/checkins/recent") {
        sendJson(response, 200, {
          items: [...database.checkins].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        });
        return;
      }

      if (method === "POST" && path === "/api/checkins") {
        const body = await readBody(request);
        const checkin = {
          id: `checkin_${randomUUID()}`,
          userId: database.users[0].id,
          createdAt: new Date().toISOString(),
          ...body
        };
        database.checkins.unshift(checkin);
        sendJson(response, 201, checkin);
        return;
      }

      const checkinMatch = path.match(/^\/api\/checkins\/([^/]+)$/);
      if (method === "GET" && checkinMatch) {
        const checkin = database.checkins.find((item) => item.id === checkinMatch[1]);
        sendJson(response, checkin ? 200 : 404, checkin ?? { message: "Check-in not found" });
        return;
      }

      if (method === "DELETE" && checkinMatch) {
        database.checkins = database.checkins.filter((item) => item.id !== checkinMatch[1]);
        sendJson(response, 200, {});
        return;
      }

      const userCheckinsMatch = path.match(/^\/api\/users\/([^/]+)\/checkins$/);
      if (method === "GET" && userCheckinsMatch) {
        sendJson(response, 200, {
          items: database.checkins.filter((item) => item.userId === userCheckinsMatch[1])
        });
        return;
      }

      if (method === "GET" && path === "/api/diary/summary") {
        const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
        const checkins = database.checkins.filter((item) => monthMatches(item.createdAt, month));
        const rated = checkins.filter((item) => typeof item.rating === "number");
        const barsVisited = new Set(checkins.map((item) => item.barId).filter(Boolean)).size;
        const averageRating = rated.length
          ? rated.reduce((sum, item) => sum + item.rating, 0) / rated.length
          : undefined;

        sendJson(response, 200, {
          month,
          checkInCount: checkins.length,
          barsVisited,
          averageRating,
          currentStreak: 2
        });
        return;
      }

      if (method === "GET" && path === "/api/diary/calendar") {
        const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
        const counts = new Map();
        for (const checkin of database.checkins.filter((item) => monthMatches(item.createdAt, month))) {
          const date = checkin.createdAt.slice(0, 10);
          counts.set(date, (counts.get(date) ?? 0) + 1);
        }
        sendJson(
          response,
          200,
          [...counts.entries()].map(([date, count]) => ({ date, count }))
        );
        return;
      }

      if (method === "GET" && path === "/api/diary/stats") {
        const categoryCounts = {};
        const moodCounts = {};
        for (const checkin of database.checkins) {
          categoryCounts[checkin.drinkCategory] = (categoryCounts[checkin.drinkCategory] ?? 0) + 1;
          for (const mood of checkin.moodTags ?? []) {
            moodCounts[mood] = (moodCounts[mood] ?? 0) + 1;
          }
        }
        sendJson(response, 200, { categoryCounts, moodCounts });
        return;
      }

      if (method === "GET" && path === "/api/bars/nearby") {
        const city = url.searchParams.get("city");
        const bars = city ? database.bars.filter((bar) => bar.city === city) : database.bars;
        sendJson(response, 200, bars);
        return;
      }

      if (method === "GET" && path === "/api/bars/rankings") {
        sendJson(response, 200, [...database.bars].sort((a, b) => b.rating - a.rating));
        return;
      }

      const barMatch = path.match(/^\/api\/bars\/([^/]+)$/);
      if (method === "GET" && barMatch) {
        const bar = database.bars.find((item) => item.id === barMatch[1]);
        sendJson(response, bar ? 200 : 404, bar ?? { message: "Bar not found" });
        return;
      }

      const barCheckinsMatch = path.match(/^\/api\/bars\/([^/]+)\/checkins$/);
      if (method === "GET" && barCheckinsMatch) {
        sendJson(response, 200, {
          items: database.checkins.filter((item) => item.barId === barCheckinsMatch[1])
        });
        return;
      }

      if (method === "GET" && path === "/api/gallery/feed") {
        const city = url.searchParams.get("city");
        const items = city
          ? database.galleryPosts.filter((post) => post.city === city)
          : database.galleryPosts;
        sendJson(response, 200, { items, nextCursor: undefined });
        return;
      }

      if (method === "POST" && path === "/api/gallery/posts") {
        const body = await readBody(request);
        const post = {
          id: `post_${randomUUID()}`,
          userId: database.users[0].id,
          authorName: database.users[0].displayName,
          likedCount: 0,
          createdAt: new Date().toISOString(),
          ...body
        };
        database.galleryPosts.unshift(post);
        sendJson(response, 201, post);
        return;
      }

      const postMatch = path.match(/^\/api\/gallery\/posts\/([^/]+)$/);
      if (method === "GET" && postMatch) {
        const post = database.galleryPosts.find((item) => item.id === postMatch[1]);
        sendJson(response, post ? 200 : 404, post ?? { message: "Post not found" });
        return;
      }

      const likeMatch = path.match(/^\/api\/gallery\/posts\/([^/]+)\/like$/);
      if (method === "POST" && likeMatch) {
        const post = database.galleryPosts.find((item) => item.id === likeMatch[1]);
        if (post) {
          post.likedCount += 1;
        }
        sendJson(response, post ? 200 : 404, post ?? { message: "Post not found" });
        return;
      }

      if (method === "POST" && path === "/api/match/session") {
        sendJson(response, 200, { sessionId: `match_${randomUUID()}` });
        return;
      }

      if (method === "POST" && path === "/api/match/answer") {
        sendJson(response, 200, {});
        return;
      }

      if (method === "GET" && path === "/api/match/candidates") {
        sendJson(response, 200, database.matchCandidates);
        return;
      }

      if (method === "POST" && path === "/api/match/request") {
        sendJson(response, 200, { status: "sent" });
        return;
      }

      if (method === "POST" && path === "/api/match/respond") {
        sendJson(response, 200, { status: "accepted" });
        return;
      }

      if (method === "GET" && path === "/api/chat/conversations") {
        sendJson(response, 200, { items: database.conversations });
        return;
      }

      const messagesMatch = path.match(/^\/api\/chat\/conversations\/([^/]+)\/messages$/);
      if (method === "GET" && messagesMatch) {
        sendJson(response, 200, {
          items: database.messages.filter((message) => message.conversationId === messagesMatch[1])
        });
        return;
      }

      if (method === "POST" && messagesMatch) {
        const body = await readBody(request);
        const message = {
          id: `msg_${randomUUID()}`,
          conversationId: messagesMatch[1],
          senderId: database.users[0].id,
          body: body.body,
          createdAt: new Date().toISOString()
        };
        database.messages.push(message);
        sendJson(response, 201, message);
        return;
      }

      const readMatch = path.match(/^\/api\/chat\/conversations\/([^/]+)\/read$/);
      if (method === "POST" && readMatch) {
        const conversation = database.conversations.find((item) => item.id === readMatch[1]);
        if (conversation) {
          conversation.unreadCount = 0;
        }
        sendJson(response, 200, {});
        return;
      }

      if (method === "GET" && path === "/api/drinks/collection") {
        sendJson(response, 200, database.drinkCollection);
        return;
      }

      const drinkMatch = path.match(/^\/api\/drinks\/([^/]+)$/);
      if (method === "GET" && drinkMatch) {
        const drink = database.drinkCollection.find((item) => item.id === drinkMatch[1]);
        sendJson(response, drink ? 200 : 404, drink ?? { message: "Drink not found" });
        return;
      }

      if (method === "GET" && path === "/api/persona/current") {
        sendJson(response, 200, {
          id: "persona_001",
          statement: database.users[0].persona,
          traits: ["citrus", "bitter", "quiet bars"],
          updatedAt: new Date().toISOString()
        });
        return;
      }

      if (method === "POST" && path === "/api/ai/recognize-drink") {
        sendJson(response, 200, {
          drinkName: "Paper Plane",
          drinkCategory: "cocktail",
          confidence: 0.82
        });
        return;
      }

      if (method === "POST" && path === "/api/ai/generate-card-copy") {
        sendJson(response, 200, {
          title: "A bright little landing",
          subtitle: "Paper Plane at Amber Room",
          body: "Citrus, bourbon, and a softer finish than expected.",
          style: "receipt"
        });
        return;
      }

      if (method === "POST" && path === "/api/ai/generate-persona") {
        sendJson(response, 200, { statement: "Late-night citrus explorer" });
        return;
      }

      if (method === "POST" && path === "/api/ai/match-reason") {
        sendJson(response, 200, { reason: "You both prefer quiet cocktail bars and bitter drinks." });
        return;
      }

      if (method === "POST" && path === "/api/ai/icebreakers") {
        sendJson(response, 200, {
          suggestions: [
            "What drink tells you a bar knows what it is doing?",
            "Quiet counter or lively table tonight?",
            "Pick one: martini, negroni, or highball?"
          ]
        });
        return;
      }

      sendJson(response, 404, { message: `No mock route for ${method} ${path}` });
    } catch (error) {
      sendJson(response, 500, {
        message: error instanceof Error ? error.message : "Mock backend error"
      });
    }
  };
}

export function createMockBackend(options = {}) {
  const database = options.database ?? cloneSeed();
  return createServer(createRouter(database));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.HOST ?? "0.0.0.0";
  const server = createMockBackend();
  server.listen(port, host, () => {
    console.log(`BarLog mock backend listening at http://${host}:${port}`);
  });
}
