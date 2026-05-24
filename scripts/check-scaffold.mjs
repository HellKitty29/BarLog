import { accessSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredPaths = [
  "app/_layout.tsx",
  "app/(tabs)/_layout.tsx",
  "app/(tabs)/diary.tsx",
  "app/(tabs)/map.tsx",
  "app/(tabs)/sip.tsx",
  "app/(tabs)/me.tsx",
  "src/services/api/client.ts",
  "src/services/api/endpoints.ts",
  "src/features/auth/auth.api.ts",
  "src/features/diary/diary.queries.ts",
  "src/features/bars/bars.queries.ts",
  "src/features/gallery/gallery.queries.ts",
  "src/features/chat/chat.queries.ts",
  "src/features/sip/sip.store.ts",
  ".env.example"
];

for (const path of requiredPaths) {
  accessSync(join(root, path));
}

console.log(`Scaffold check passed: ${requiredPaths.length} required files exist.`);
