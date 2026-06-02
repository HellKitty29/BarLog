# Bars Natural Language Search Contract

The Discover -> Bars screen now sends a free-text question to the existing nearby bars endpoint.

## Frontend Request

`GET /api/bars/nearby`

Query params:

```text
lat=31.2206
lng=121.4548
radiusMeters=2000
query=quiet jazz bar for a date night
```

`query` is optional. If it is absent, keep the existing nearby bar behavior.

## Backend Recommendation

Google Maps does not expose a chat-style LLM endpoint for this use case, but the official Places API has **Text Search (New)** for text place queries. Use the frontend `query` as Google's `textQuery`, and bias results with the supplied `lat/lng`.

Google endpoint:

```text
POST https://places.googleapis.com/v1/places:searchText
```

Request body shape:

```json
{
  "textQuery": "quiet jazz bar for a date night",
  "includedType": "bar",
  "locationBias": {
    "circle": {
      "center": {
        "latitude": 31.2206,
        "longitude": 121.4548
      },
      "radius": 2000
    }
  }
}
```

Use an `X-Goog-FieldMask` that includes only fields needed by the frontend, such as:

```text
places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.types
```

Return the same frontend response shape as normal nearby bars:

```ts
{
  items: Bar[];
  source: "google_places" | "mock_fallback" | "google_places_error";
  message?: string;
}
```

