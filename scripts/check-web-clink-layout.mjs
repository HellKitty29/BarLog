import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src/web/App.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "src/web/styles.css"), "utf8");

const requiredAppMarkers = [
  "function ClinkIcon",
  "label=\"Clink\"",
  "Nearby Radar",
  "Direct Chats",
  "slice(0, 3)",
  "function getCandidateProfile",
  "profile.drunkTi",
  "STREAM SYNCHRONIZED",
  "className=\"clink-match-card",
  "className=\"clink-chat-shell"
];

for (const marker of requiredAppMarkers) {
  if (!appSource.includes(marker)) {
    throw new Error(`Web Clink layout check failed: missing App marker ${marker}`);
  }
}

const requiredStyleMarkers = [
  ".clink-panel",
  ".clink-tabs",
  ".clink-radar-card",
  ".clink-match-card",
  ".clink-drunkti-badge",
  ".clink-score",
  ".clink-chat-shell",
  ".clink-message-bubble",
  ".clink-compose"
];

for (const marker of requiredStyleMarkers) {
  if (!stylesSource.includes(marker)) {
    throw new Error(`Web Clink layout check failed: missing CSS marker ${marker}`);
  }
}

console.log("Web Clink layout check passed: Clink page, match cards, DrunkTI badges, and chat shell are wired.");
