import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const nativeGallery = readFileSync(join(root, "src/components/gallery/GalleryFeedList.tsx"), "utf8");
const webApp = readFileSync(join(root, "src/web/App.tsx"), "utf8");
const apiDoc = readFileSync(join(root, "docs/API_CHECKIN_COMMUNITY_CHAT.md"), "utf8");

function assertNotIncludes(source, marker, label) {
  if (source.includes(marker)) {
    throw new Error(`Gallery unlocked check failed: ${label}`);
  }
}

assertNotIncludes(nativeGallery, "COMMUNITY_CHECKIN_REQUIRED", "native gallery should not require today's check-in");
assertNotIncludes(nativeGallery, "showCheckIn", "native gallery should not show a check-in gate action");
assertNotIncludes(nativeGallery, "router.push(\"/sip/capture\")", "native gallery should not route users to check-in to unlock feed");
assertNotIncludes(webApp, "COMMUNITY_CHECKIN_REQUIRED", "web gallery should not require today's check-in");
assertNotIncludes(apiDoc, "需今日打卡", "community API docs should not document a check-in gate");
assertNotIncludes(apiDoc, "今日尚未打卡，社区未解锁", "error docs should not document a locked community");

console.log("Gallery unlocked check passed: users can view gallery without checking in first.");
