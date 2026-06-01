import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src/web/App.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "src/web/styles.css"), "utf8");

const requiredAppMarkers = [
  "const barAdSlides",
  "function BarAdCarousel",
  "function BoozerMapModal",
  "onOpenBoozerMap={() => setBoozerMapOpen(true)}",
  "className={`boozer-map-point"
];

for (const marker of requiredAppMarkers) {
  if (!appSource.includes(marker)) {
    throw new Error(`Web Discover ads check failed: missing App marker ${marker}`);
  }
}

if (!appSource.includes("{/* MapPreview")) {
  throw new Error("Web Discover ads check failed: existing map preview should be commented out in Bars.");
}

const requiredStyleMarkers = [
  ".bar-ad-carousel",
  ".bar-ad-slide.is-boozer-map",
  "animation: booze-map-glow",
  ".boozer-map-modal",
  ".feed-card {",
  "grid-template-columns: 1fr;",
  ".feed-card-photo {",
  "aspect-ratio: 1.18;"
];

for (const marker of requiredStyleMarkers) {
  if (!stylesSource.includes(marker)) {
    throw new Error(`Web Discover ads check failed: missing CSS marker ${marker}`);
  }
}

console.log("Web Discover ads check passed: gallery cards, ad carousel, and boozer map modal are wired.");
