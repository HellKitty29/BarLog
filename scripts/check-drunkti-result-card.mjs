import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const webApp = readFileSync(join(root, "src/web/App.tsx"), "utf8");
const webStyles = readFileSync(join(root, "src/web/styles.css"), "utf8");
const nativeDiary = readFileSync(join(root, "app/(tabs)/diary.tsx"), "utf8");
const nativeMe = readFileSync(join(root, "app/(tabs)/me.tsx"), "utf8");

function assertIncludes(source, marker, label) {
  if (!source.includes(marker)) {
    throw new Error(`DrunkTI result card check failed: missing ${label}`);
  }
}

assertIncludes(webApp, "completedResult", "web modal completed result state");
assertIncludes(webApp, "function DrunkTiResultCard", "web DrunkTI result card component");
assertIncludes(webApp, "<DrunkTiResultCard result={completedResult}", "web modal shows result card after final answer");
assertIncludes(webApp, "<DrunkTiResultCard result={drunkTiResult}", "web Me shows saved result card");
assertIncludes(webStyles, ".drunkti-result-card", "web result card styles");
assertIncludes(webApp, 'variant="profile"', "web Me uses profile result card variant");
assertIncludes(webStyles, ".drunkti-result-card.is-profile", "web profile result card variant style");
assertIncludes(webStyles, "border: 0;", "web profile result card border removed");

assertIncludes(nativeDiary, "completedResult", "native modal completed result state");
assertIncludes(nativeDiary, "DrunkTiResultCard", "native modal result card");
assertIncludes(nativeDiary, "result={completedResult}", "native modal shows result card after final answer");
assertIncludes(nativeMe, "DrunkTiResultCard", "native Me shows saved result card");

console.log("DrunkTI result card check passed.");
