import { normalizeRecentSipsResponse } from "../src/features/diary/diary.helpers";

const wrapped = normalizeRecentSipsResponse({ items: [{ id: "sip_1" }] });
if (wrapped.items.length !== 1 || wrapped.items[0]?.id !== "sip_1") {
  throw new Error("Recent sips response check failed: wrapped items should be preserved.");
}

const legacyArray = normalizeRecentSipsResponse([{ id: "sip_2" }]);
if (legacyArray.items.length !== 1 || legacyArray.items[0]?.id !== "sip_2") {
  throw new Error("Recent sips response check failed: legacy array responses should be wrapped.");
}

const emptyObject = normalizeRecentSipsResponse({});
if (emptyObject.items.length !== 0) {
  throw new Error("Recent sips response check failed: missing items should normalize to an empty array.");
}

console.log("Recent sips response check passed: diary responses always expose an items array.");
