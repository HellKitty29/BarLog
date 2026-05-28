import { normalizeNearbyBarsResponse } from "../src/features/bars/bars.helpers";

const wrapped = normalizeNearbyBarsResponse({ items: [{ id: "bar_1", name: "Sober", city: "Shanghai" }] });
if (wrapped.items.length !== 1 || wrapped.items[0]?.id !== "bar_1") {
  throw new Error("Nearby bars response check failed: wrapped items should be preserved.");
}

const arrayResponse = normalizeNearbyBarsResponse([{ id: "bar_2", name: "Union", city: "Shanghai" }]);
if (arrayResponse.items.length !== 1 || arrayResponse.items[0]?.id !== "bar_2") {
  throw new Error("Nearby bars response check failed: array responses should be wrapped.");
}

const dataResponse = normalizeNearbyBarsResponse({ data: [{ id: "bar_3", name: "Botanist", city: "Shanghai" }] });
if (dataResponse.items.length !== 1 || dataResponse.items[0]?.id !== "bar_3") {
  throw new Error("Nearby bars response check failed: data arrays should be wrapped.");
}

const barsResponse = normalizeNearbyBarsResponse({ bars: [{ id: "bar_4", name: "Lantern", city: "Shanghai" }] });
if (barsResponse.items.length !== 1 || barsResponse.items[0]?.id !== "bar_4") {
  throw new Error("Nearby bars response check failed: bars arrays should be wrapped.");
}

const coordinateResponse = normalizeNearbyBarsResponse({
  results: [{ id: "bar_5", name: "Union", city: "Shanghai", latitude: 31.22, longitude: 121.45, distance_meters: 120 }]
});
if (coordinateResponse.items[0]?.lat !== 31.22 || coordinateResponse.items[0]?.lng !== 121.45 || coordinateResponse.items[0]?.distanceMeters !== 120) {
  throw new Error("Nearby bars response check failed: latitude, longitude, and distance_meters should normalize to app fields.");
}

console.log("Nearby bars response check passed: backend response shapes expose an items array.");
