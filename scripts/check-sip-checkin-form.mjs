import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const webApp = readFileSync(join(root, "src/web/App.tsx"), "utf8");
const webStyles = readFileSync(join(root, "src/web/styles.css"), "utf8");
const nativeCapture = readFileSync(join(root, "app/sip/capture.tsx"), "utf8");

const requiredWebMarkers = [
  "fillNearestBarForWebCheckIn",
  "barsApi.getNearby",
  "getRandomClassicCocktailName",
  "<HeartRating value={rating}",
  "<WeatherMoodPicker value={mood}",
  "className=\"drink-or-row\"",
  "Saying something..."
];

const requiredNativeMarkers = [
  "fillNearestBarForNativeCheckIn",
  "barsApi.getNearby",
  "getRandomClassicCocktailName",
  "<HeartRating value={rating}",
  "<WeatherMoodPicker value={mood}",
  "styles.drinkOrRow",
  "Saying something..."
];

const requiredStyleMarkers = [
  ".heart-rating",
  ".heart-rating-heart",
  ".weather-mood-grid",
  ".drink-or-row"
];

for (const marker of requiredWebMarkers) {
  if (!webApp.includes(marker)) {
    throw new Error(`Sip check-in form check failed: missing web marker ${marker}`);
  }
}

for (const marker of requiredNativeMarkers) {
  if (!nativeCapture.includes(marker)) {
    throw new Error(`Sip check-in form check failed: missing native marker ${marker}`);
  }
}

for (const marker of requiredStyleMarkers) {
  if (!webStyles.includes(marker)) {
    throw new Error(`Sip check-in form check failed: missing web CSS marker ${marker}`);
  }
}

if (webApp.includes("Field label=\"Rating\"><input") || nativeCapture.includes("<SipInput keyboardType=\"decimal-pad\" onChangeText={setRating}")) {
  throw new Error("Sip check-in form check failed: rating must not be a numeric text input.");
}

if (webApp.includes("Field label=\"Mood\"><input") || nativeCapture.includes("<SipInput onChangeText={setMood} value={mood}")) {
  throw new Error("Sip check-in form check failed: mood must not be a free text input.");
}

if (webApp.includes("<h2>Complete the check-in</h2>") || nativeCapture.includes("Complete the check-in")) {
  throw new Error("Sip check-in form check failed: edit card title should be removed.");
}

if (webApp.includes("drinkCategories.map") || nativeCapture.includes("categoryOptions.map")) {
  throw new Error("Sip check-in form check failed: category choices should be the compact whisky/wine/beer/other row.");
}

console.log("Sip check-in form check passed: nearest bar autofill, heart rating, weather mood, and note label are wired.");
