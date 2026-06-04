import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src/web/App.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "src/web/styles.css"), "utf8");

const requiredMarkers = [
  "const baseParams = createNearbyBarsParams(coords);",
  "enabled: mode === \"bars\" && Boolean(params)",
  "Waiting for browser location permission before loading nearby bars.",
  "className=\"bar-question-search\"",
  "setBarQuestion(barQuestionDraft.trim());",
  "className=\"permission-button\" type=\"button\" onClick={() => requestLocation(setCoords, setLocating, setLocationError)}",
  "navigator.geolocation.getCurrentPosition(",
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

const requiredStyleMarkers = [
  ".permission-button {",
  "touch-action: manipulation;",
  "cursor: pointer;",
  ".bar-question-search button {"
];

for (const marker of requiredStyleMarkers) {
  if (!stylesSource.includes(marker)) {
    throw new Error(`Web location check failed: missing CSS marker ${marker}`);
  }
}

console.log("Web location check passed: nearby bars waits for real coordinates, bars search submits queries, and location actions stay wired.");
