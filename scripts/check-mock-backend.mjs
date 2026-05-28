import assert from "node:assert/strict";
import { createMockBackend } from "../mock-server/server.mjs";

const server = createMockBackend();

await new Promise((resolve) => {
  server.listen(0, "127.0.0.1", resolve);
});

const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer mock-access-token",
      ...options?.headers
    },
    ...options
  });
  const json = await response.json();
  return { response, json };
}

try {
  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "demo@barlog.app", password: "password123" })
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.json.accessToken, "mock-access-token");
  assert.equal(login.json.user.displayName, "Mina Chen");

  const diary = await request("/api/diary/summary?month=2026-05");
  assert.equal(diary.response.status, 200);
  assert.equal(diary.json.month, "2026-05");
  assert.equal(typeof diary.json.checkInCount, "number");

  const bars = await request("/api/bars/nearby?city=Shanghai");
  assert.equal(bars.response.status, 200);
  const barItems = Array.isArray(bars.json) ? bars.json : bars.json.items;
  assert.ok(Array.isArray(barItems));
  assert.ok(barItems.length > 0);

  const created = await request("/api/checkins", {
    method: "POST",
    body: JSON.stringify({
      photoUrl: "https://images.barlog.app/local/sip.jpg",
      drinkName: "Paper Plane",
      drinkCategory: "cocktail",
      moodTags: ["bright"],
      cardStyle: "receipt",
      visibility: "private"
    })
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.json.drinkName, "Paper Plane");

  const recent = await request("/api/checkins/recent");
  assert.equal(recent.response.status, 200);
  assert.equal(recent.json.items[0].drinkName, "Paper Plane");

  const upload = await request("/api/uploads/image", {
    method: "POST",
    body: JSON.stringify({ fileName: "sip.jpg" })
  });
  assert.equal(upload.response.status, 200);
  assert.match(upload.json.imageUrl, /^https:\/\/images\.barlog\.local\//);

  console.log("Mock backend check passed.");
} finally {
  await new Promise((resolve) => server.close(resolve));
}
