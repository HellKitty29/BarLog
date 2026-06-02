# Google Auth API Contract

Base URL follows `EXPO_PUBLIC_API_BASE_URL`.

These endpoints are used by the web app `Enter with Google` button in both Login and Register modes.

## 1. Start Google OAuth

`POST /api/auth/google/start`

Request:

```json
{
  "redirectUri": "https://app.example.com/auth/google/callback",
  "mode": "login"
}
```

`mode` must be either:

- `login`: only allow sign-in for an existing BarLog account linked to this Google identity.
- `register`: create/link a BarLog account from the verified Google identity when no account exists yet.

Response `200`:

```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Backend requirements:

- Include the supplied `redirectUri` and `mode` in OAuth state/session.
- Add the `redirectUri` to the backend allowlist and Google OAuth allowed redirect URLs.
- Redirect the browser to Google's OAuth authorization URL through the returned `authUrl`.

## 2. OAuth Callback Redirect

After Google verification, backend redirects to the original `redirectUri`.

Success redirect:

```text
{redirectUri}?accessToken=<jwt>&refreshToken=<optional-refresh-token>
```

Failure redirect:

```text
{redirectUri}?error=<url-encoded-message>
```

## 3. Complete Google Auth

`POST /api/auth/google/complete`

Request:

```json
{
  "accessToken": "jwt-from-callback",
  "refreshToken": "optional-refresh-token"
}
```

Response `200`:

```json
{
  "user": {
    "id": "user-id",
    "displayName": "Mina Chen",
    "email": "mina@example.com",
    "avatarUrl": "https://...",
    "city": "Shanghai"
  },
  "accessToken": "jwt",
  "refreshToken": "optional-refresh-token"
}
```

The response shape must match normal email/password login and register responses.

