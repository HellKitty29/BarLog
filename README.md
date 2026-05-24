# BarLog Mobile

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
