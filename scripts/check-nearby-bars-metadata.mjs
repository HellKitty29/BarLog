import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const apiSource = readFileSync(join(root, "src/features/bars/bars.api.ts"), "utf8");
const mapSource = readFileSync(join(root, "app/(tabs)/map.tsx"), "utf8");

if (!apiSource.includes("return Array.isArray(response) ? { items: response, source: \"mock_fallback\" as const, message: undefined } : response;")) {
  throw new Error("Nearby bars metadata check failed: barsApi should preserve backend source/message metadata.");
}

if (!mapSource.includes("nearbyBars.data?.items")) {
  throw new Error("Nearby bars metadata check failed: map screen should read bars from response.items.");
}

if (!mapSource.includes("nearbyBars.data?.message ??")) {
  throw new Error("Nearby bars metadata check failed: empty state should expose backend diagnostics.");
}

console.log("Nearby bars metadata check passed: empty states include backend diagnostics.");
