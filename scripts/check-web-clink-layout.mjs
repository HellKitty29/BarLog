import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src/web/App.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "src/web/styles.css"), "utf8");

const requiredAppMarkers = [
  "function ClinkIcon",
  "label=\"Clink\"",
  "Nearby Radar",
  "Clinks",
  "slice(0, 3)",
  "visibleConversations",
  "pendingConversationId",
  "pendingConversation",
  "initialConversationId",
  "initialConversationFallback",
  "onInitialConversationOpened",
  "activeConversationFallback",
  "lockedChatShellHeight",
  "getClinkChatShellHeight",
  "--clink-chat-shell-height",
  "onOpenClinks({",
  "function getCandidateProfile",
  "profile.drunkTi",
  "className=\"clink-match-card",
  "className=\"clink-chat-shell",
  "discover-header-action",
  "DrunkTI",
  "Say Hello"
];

for (const marker of requiredAppMarkers) {
  if (!appSource.includes(marker)) {
    throw new Error(`Web Clink layout check failed: missing App marker ${marker}`);
  }
}

const forbiddenAppMarkers = [
  "RECENT CLINKS",
  "match-saved-strip",
  "Direct Chats"
];

for (const marker of forbiddenAppMarkers) {
  if (appSource.includes(marker)) {
    throw new Error(`Web Clink layout check failed: forbidden App marker ${marker}`);
  }
}

const requiredStyleMarkers = [
  ".clink-panel",
  ".clink-tabs",
  ".clink-match-card",
  ".clink-drunkti-badge",
  ".clink-score",
  ".clink-chat-shell",
  ".clink-message-bubble",
  ".clink-compose",
  ".discover-header-row",
  ".discover-header-action",
  "height: clamp(300px, var(--clink-chat-shell-height, 500px), 500px)",
  "font-size: 16px;"
];

for (const marker of requiredStyleMarkers) {
  if (!stylesSource.includes(marker)) {
    throw new Error(`Web Clink layout check failed: missing CSS marker ${marker}`);
  }
}

console.log("Web Clink layout check passed: Clink page, match cards, DrunkTI badges, and chat shell are wired.");
