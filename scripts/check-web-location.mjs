import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src/web/App.tsx"), "utf8");

const requiredMarkers = [
  "const baseParams = createNearbyBarsParams(coords);",
  "enabled: mode === \"bars\" && Boolean(params)",
  "Waiting for browser location permission before loading nearby bars.",
  "const [city, setCity] = useState(\"Locating\");",
  "setCity(\"Current City\");"
];

for (const marker of requiredMarkers) {
  if (!appSource.includes(marker)) {
    throw new Error(`Web location check failed: missing marker ${marker}`);
  }
}

const forbiddenMarkers = [
  "createNearbyBarsParams(referenceCoords)",
  "useState(\"Shanghai\")",
  "Showing the default Shanghai map until browser location permission is available."
];

for (const marker of forbiddenMarkers) {
  if (appSource.includes(marker)) {
    throw new Error(`Web location check failed: forbidden marker ${marker}`);
  }
}

console.log("Web location check passed: nearby bars waits for real coordinates and header city is not hard-coded to Shanghai.");
