import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const mapRegionPath = join(root, "src/services/location/map-region.ts");
const mapScreenPath = join(root, "app/(tabs)/map.tsx");

const mapRegionSource = readFileSync(mapRegionPath, "utf8");
const mapScreenSource = readFileSync(mapScreenPath, "utf8");

const requiredSnippets = [
  ["uses current coords for latitude", "latitude: coords.lat"],
  ["uses current coords for longitude", "longitude: coords.lng"],
  ["does not build nearby params without coords", "return null;"],
  ["queries bars only after coords exist", "enabled: Boolean(nearbyBarsParams)"],
  ["does not pass a Singapore region to the map", "region={userRegion}"]
];

for (const [label, snippet] of requiredSnippets) {
  if (!mapRegionSource.includes(snippet) && !mapScreenSource.includes(snippet)) {
    throw new Error(`Location params check failed: ${label}`);
  }
}

if (/singaporeRegion|defaultSingaporeLocation/.test(mapScreenSource)) {
  throw new Error("Location params check failed: map screen still references Singapore fallback coordinates.");
}

console.log("Location params check passed: nearby bars use real user coordinates.");
