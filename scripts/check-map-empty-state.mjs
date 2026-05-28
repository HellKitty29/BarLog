import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const mapScreenSource = readFileSync(join(root, "app/(tabs)/map.tsx"), "utf8");
const nativeMapSource = readFileSync(join(root, "src/components/map/BarMapPreview.native.tsx"), "utf8");
const webMapSource = readFileSync(join(root, "src/components/map/BarMapPreview.web.tsx"), "utf8");

if (!mapScreenSource.includes("bars={nearbyBars.data?.items}")) {
  throw new Error("Map empty state check failed: map screen should pass undefined bars while the nearby query is loading.");
}

for (const [label, source] of [
  ["native", nativeMapSource],
  ["web", webMapSource]
]) {
  if (!source.includes("const hasBars = Boolean(bars?.length);")) {
    throw new Error(`Map empty state check failed: ${label} map should distinguish no data from bars without coordinates.`);
  }

  if (!source.includes("hasBars && !barsWithLocation.length")) {
    throw new Error(`Map empty state check failed: ${label} map should only show missing location text after bars are returned.`);
  }
}

console.log("Map empty state check passed: loading maps do not show missing bar locations.");
