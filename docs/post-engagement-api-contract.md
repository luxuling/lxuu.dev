# Post engagement API — HTTP contract

This contract is for an **external** engagement service consumed by **lxuu.dev** (or other frontends). It does **not** serve post Markdown; the site resolves content from GitHub. All engagement rows use **`post_slug`**: a stable string agreed with the static site (typically the MDX entry id without extension).

**Base URL**: implementation-defined, for example `https://api.engagement.example.com`.

Routes are rooted at the **base URL** with **no `/v1` or other version prefix**; reserve versioning for a future hostname or header-based negotiation if needed.

**Content type**: request bodies with a body use `Content-Type: application/json`. Responses use `application/json` unless noted (OAuth redirects use `302` with `Location`).

**Chosen auth transport for this contract**: **HttpOnly session cookie** set by the API origin after OAuth callback. The browser sends `Cookie: session=<opaque>` on subsequent requests. Alternative **Bearer JWT** is summarized in [Alternative: Bearer token](#alternative-bearer-token).

---

## Conventions

### `post_slug`

- Type: string, **1–128** characters, recommended charset: `[a-z0-9-]` (kebab-case).
- Case sensitivity: **exact match**, case-sensitive (implementations should normalize on write if they choose lowercase-only).

### Pagination (cursor)

Query: `limit` (default `20`, max `100`), `cursor` (opaque string, optional).

Response list payloads include:

```json
{
  "items": [],
  "next_cursor": "opaque-or-null"
}
```

When `next_cursor` is `null`, there is no next page.

### Error envelope

Failed requests return JSON:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Human-readable summary",
    "details": {}
  }
}
```

`details` is optional; may include validation field errors, for example `{ "fields": { "body": "too_short" } }`.

| HTTP status | Meaning                                                       |
| ----------- | ------------------------------------------------------------- |
| `400`       | Malformed JSON or validation failure                          |
| `401`       | Missing or invalid session                                    |
| `403`       | Authenticated but not allowed on this resource                |
| `404`       | Unknown route or unknown `post_slug` if you enforce allowlist |
| `409`       | Conflict (e.g. duplicate like if not idempotent)              |
| `429`       | Rate limited                                                  |
| `500`       | Server error                                                  |

### Rate limiting

- Apply stricter limits on `POST /posts/{post_slug}/views` and auth endpoints.
- On `429`, include header **`Retry-After`** (seconds) when possible.

**Error code** for throttling: `RATE_LIMITED`.

---

## CORS (lxuu.dev calling a different API origin)

When the site is `https://lxuu.dev` and the API is another host:

- Respond to **preflight** `OPTIONS` for routes used from the browser.
- **`Access-Control-Allow-Origin`**: either `https://lxuu.dev` (recommended) or a configurable allowlist — **not** `*` if cookies are used.
- **`Access-Control-Allow-Credentials`**: `true` so `fetch(..., { credentials: 'include' })` sends the session cookie.
- **`Access-Control-Allow-Methods`**: `GET, POST, PATCH, DELETE, OPTIONS`.
- **`Access-Control-Allow-Headers`**: at minimum `Content-Type`, `Authorization` (if you add Bearer later), **`Idempotency-Key`** (optional header below).

Cookie session cookie must use **`SameSite=None; Secure`** if the API host differs from the site (cross-site); **`SameSite=Lax`** is enough if the API is a **subdomain** with a shared registrable domain and you use a single parent domain cookie (implementation detail).

---

## Public routes

### `GET /posts/{post_slug}/stats`

Returns aggregate counts for the post.

**Response `200`:**

```json
{
  "post_slug": "my-first-post",
  "view_count": 12040,
  "like_count": 87,
  "comment_count": 14
}
```

If the post row does not exist yet, return **zeros** (implementation may lazy-create `post_counters` on first view/like/comment).

---

### `POST /posts/{post_slug}/views`

Records a view (typically called once per page load from the frontend).

**Request body (optional):**

```json
{
  "visitor_key": "opaque-client-generated-uuid-stored-in-localStorage"
}
```

`visitor_key` is optional; the server may still bucket by IP + `User-Agent` + date for deduplication. Empty body `{}` is valid.

**Response `204`**: No body.

**Response `200`** (if you prefer explicit payload):

```json
{
  "post_slug": "my-first-post",
  "view_count": 12041
}
```

Either `204` or `200` is acceptable; pick one in the implementation and document it. This contract recommends **`204`** for fire-and-forget.

**Rate limit**: per IP + optional `visitor_key` + `post_slug` (e.g. max N per day). On exceed: `429` + `RATE_LIMITED`.

**Auth**: none.

---

## Authenticated routes (session cookie)

Assume cookie name **`session`** (configurable). If missing or invalid: **`401`** with `code: "UNAUTHORIZED"`.

### `GET /me`

**Response `200`:**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_name": "Ada",
    "avatar_url": "https://avatars.githubusercontent.com/u/1?v=4"
  }
}
```

---

### `GET /posts/{post_slug}/likes/me`

Whether the current user liked this post.

**Response `200`:**

```json
{
  "liked": true
}
```

---

### `PUT /posts/{post_slug}/likes/me`

**Idempotent** like: if already liked, **`204`** (or `200` with same body). If newly liked, **`201`**.

**Optional header**: `Idempotency-Key: <uuid>` — server may dedupe concurrent retries.

**Response `201`:**

```json
{
  "post_slug": "my-first-post",
  "like_count": 88,
  "liked": true
}
```

**Response `204`**: already liked; body empty.

---

### `DELETE /posts/{post_slug}/likes/me`

**Idempotent** unlike.

**Response `200`:**

```json
{
  "post_slug": "my-first-post",
  "like_count": 87,
  "liked": false
}
```

**Response `204`**: was not liked; body empty.

---

### `GET /posts/{post_slug}/comments`

Public read (no session required). Excludes soft-deleted comments.

**Query:** `limit`, `cursor`

**Response `200`:**

```json
{
  "items": [
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "post_slug": "my-first-post",
      "body": "Great write-up.",
      "created_at": "2026-05-13T10:15:30.000Z",
      "edited_at": null,
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "display_name": "Ada",
        "avatar_url": "https://..."
      },
      "mine": false
    }
  ],
  "next_cursor": null
}
```

`mine` is `true` when a valid session exists **and** `author.id` equals the current user; otherwise `false` (for anonymous readers, always `false`).

---

### `POST /posts/{post_slug}/comments`

**Auth required.**

**Request body:**

```json
{
  "body": "Plain text comment."
}
```

Validation:

- `body`: string, **1–4000** characters after trim; reject empty with `400` / `VALIDATION_ERROR`.

**Response `201`:**

```json
{
  "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "post_slug": "my-first-post",
  "body": "Plain text comment.",
  "created_at": "2026-05-13T10:15:30.000Z",
  "edited_at": null,
  "author": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "display_name": "Ada",
    "avatar_url": "https://..."
  }
}
```

---

### `PATCH /comments/{comment_id}`

**Auth required.** Only the author may edit.

**Request body:**

```json
{
  "body": "Updated text."
}
```

**Response `200`:** same shape as `POST` comment response, with updated `body` and non-null `edited_at` if changed.

**Errors:**

- `404` if comment missing or soft-deleted.
- `403` if not author.

---

### `DELETE /comments/{comment_id}`

**Auth required.** Soft delete.

**Response `204`**: No body.

**Errors:** `403`, `404` as above.

---

## Auth — OAuth 2.0 (GitHub and Google)

Use standard authorization code flow with **PKCE** recommended for public clients; for a confidential server-side client, PKCE is still fine.

### Start login

**`GET /auth/{provider}/start`**

- `provider`: `github` | `google`
- Query: `redirect_uri` — **optional** absolute URL on **lxuu.dev** (or your frontend) where the user lands **after** session is established; if omitted, use a server-configured default post-login page.

**Behavior:**

1. Generate `state` (and `code_verifier` if PKCE).
2. **`302`** redirect to GitHub or Google authorize URL with `client_id`, `redirect_uri` pointing to the API callback below, `scope`, `state`, and PKCE `code_challenge` if used.

---

### OAuth callback (browser redirect endpoint)

**`GET /auth/{provider}/callback`**

- Query params from IdP: `code`, `state`, `error`, etc.

**Behavior:**

1. Validate `state`.
2. Exchange `code` for tokens at the IdP.
3. Resolve IdP user profile; upsert `users` + `oauth_accounts`.
4. Create **session** row; **`Set-Cookie`** on the API domain:

   ```
   Set-Cookie: session=<opaque>; HttpOnly; Secure; Path=/; Max-Age=...; SameSite=None
   ```

   (Adjust `SameSite` per [CORS](#cors-lxuu-dev-calling-a-different-api-origin) section.)

5. **`302`** redirect to `redirect_uri` from `state` or default frontend URL (e.g. `https://lxuu.dev/posts/hello`).

**Error:** redirect to frontend with query `?error=oauth_failed` or return `400` JSON if you prefer non-browser clients (pick one; browser flow should redirect).

---

### Logout

**`POST /auth/logout`**

**Auth:** session cookie optional; if present, invalidate session server-side.

**Response `204`**.

**Set-Cookie:** expire the `session` cookie (e.g. `Max-Age=0`).

---

### Session probe (optional)

**`GET /auth/session`**

**Response `200`** if cookie valid, same body as **`GET /me`** wrapped or bare user:

```json
{
  "authenticated": true,
  "user": { "id": "...", "display_name": "...", "avatar_url": "..." }
}
```

**Response `200`** if no cookie:

```json
{
  "authenticated": false,
  "user": null
}
```

(Alternatively **`401`** when unauthenticated; choose one style globally.)

---

## Alternative: Bearer token

If the API issues **JWT access tokens** instead of cookies:

- Login endpoints return JSON `{ "access_token": "...", "token_type": "Bearer", "expires_in": 3600 }`.
- Clients send **`Authorization: Bearer <token>`** on `/me`, likes, and comment mutations.
- **CORS** is simpler (`Access-Control-Allow-Origin` may still be an allowlist).
- Document **`GET /auth/{provider}/start`** to return JSON with an **`authorization_url`** for SPA flows, or keep redirect-based login in a small popup.

This contract’s route tables above stay the same except **Auth** becomes `Authorization` header instead of `Cookie`.

---

## Optional: `post_slug` allowlist

If the API should reject unknown slugs:

- `GET /posts/{post_slug}/stats` → **`404`** with `code: "POST_NOT_FOUND"`.
- Mutations likewise.

Maintenance: sync list from CI or admin config in the API project.

---

## Summary route table

| Method   | Path                          | Auth     | Description             |
| -------- | ----------------------------- | -------- | ----------------------- |
| `GET`    | `/posts/{post_slug}/stats`    | No       | Aggregate counts        |
| `POST`   | `/posts/{post_slug}/views`    | No       | Record view             |
| `GET`    | `/posts/{post_slug}/comments` | No       | List comments           |
| `GET`    | `/posts/{post_slug}/likes/me` | Yes      | Like state for user     |
| `PUT`    | `/posts/{post_slug}/likes/me` | Yes      | Like (idempotent)       |
| `DELETE` | `/posts/{post_slug}/likes/me` | Yes      | Unlike (idempotent)     |
| `POST`   | `/posts/{post_slug}/comments` | Yes      | Create comment          |
| `PATCH`  | `/comments/{comment_id}`      | Yes      | Edit own comment        |
| `DELETE` | `/comments/{comment_id}`      | Yes      | Soft-delete own comment |
| `GET`    | `/me`                         | Yes      | Current user            |
| `GET`    | `/auth/{provider}/start`      | No       | Redirect to IdP         |
| `GET`    | `/auth/{provider}/callback`   | No       | OAuth callback          |
| `POST`   | `/auth/logout`                | Optional | Invalidate session      |
| `GET`    | `/auth/session`               | Optional | Session probe           |

---

## Out of scope (initial release)

- Nested comments, markdown bodies, moderation APIs, WebSockets, webhooks.
