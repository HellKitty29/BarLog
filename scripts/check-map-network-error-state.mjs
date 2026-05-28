import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const mapSource = readFileSync(join(root, "app/(tabs)/map.tsx"), "utf8");

if (!mapSource.includes("nearbyBarsErrorMessage")) {
  throw new Error("Map network error check failed: map screen should provide a network-specific error message.");
}

if (!mapSource.includes("!nearbyBars.isError &&")) {
  throw new Error("Map network error check failed: empty bars state should be hidden while the query is in error state.");
}

console.log("Map network error check passed: query errors do not render empty bars state.");
