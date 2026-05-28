# BarLog Mobile

### All alcoholists welcome to your Hole! Just Dig your private obssesion here, meet someone with your burning ethanol heart.

Expo Router + React Native + TypeScript scaffold for BarLog.

This project is backend-first. Screens call feature APIs through `src/services/api/client.ts`; set the backend URL in `.env`:

```text
EXPO_PUBLIC_API_BASE_URL=https://api.barlog.app
```

## Commands

```bash
npm install
npm run typecheck
npm run start
```

## Local Mock Backend

The mock backend exposes the same HTTP paths as the real backend contract. It does not replace the frontend API layer; point the app at it with:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

Run it with:

```bash
npm run mock:backend
```

Demo login:

```text
demo@barlog.app / password123
```

## Architecture

- `app/`: Expo Router routes.
- `src/features/`: API functions, query hooks, stores, and types by product domain.
- `src/services/`: shared technical services such as HTTP, storage, camera, location, media.
- `src/components/`: reusable UI and layout primitives.
- `src/theme/`: design tokens.

## Community / Gallery Backend Reminder

The mobile app treats Community and Gallery as the same feed. Both screens read:

```text
GET /api/gallery/feed?city=Shanghai&range=24h
```

The response should keep the existing frontend shape:

```ts
{
  items: Array<{
    id: string;
    userId: string;
    authorName: string;
    imageUrl: string;
    caption?: string;
    city?: string;
    barName?: string;
    likedCount: number;
    createdAt: string;
  }>;
  nextCursor?: string;
}
```

For the real backend, public or `tonight_only` check-ins should be projected into this feed after `POST /api/checkins`. A practical mapping is `imageUrl = cardImageUrl ?? photoUrl`, `caption = vibeMumbling`, plus `barName`, `city`, `userId`, `authorName`, `createdAt`, and `likedCount`.

If the backend later needs a stronger relation between a feed post and its source check-in, add an optional `checkInId` or `sourceCheckInId` field deliberately across the API contract. The current frontend does not require that field.
