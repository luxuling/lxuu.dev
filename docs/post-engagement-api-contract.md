# Post engagement API — HTTP contract

Engagement routes are **Astro API routes** (`src/pages/api/`) inside this repo — same origin as the frontend. No external service, no CORS configuration needed.

**Base URL**: `/api` (same-origin, relative).

Routes are rooted at `/api` with **no `/v1` or other version prefix**.

**Content type**: request bodies use `Content-Type: application/json`. Responses use `application/json` unless noted (OAuth redirects use `302` with `Location`).

**Auth transport**: **HttpOnly session cookie** (`session=<opaque>`) set after OAuth callback. The browser sends it automatically on same-origin requests — no `credentials: 'include'` needed.

---

## Conventions

### `post_slug`

- Type: string, **1–128** characters, recommended charset: `[a-z0-9-]` (kebab-case).
- Case sensitivity: **exact match**, case-sensitive (implementations should normalize on write if they choose lowercase-only).
- **i18n**: posts are organized as a folder named after the title (e.g. `my-first-post/`) containing per-locale files (`en.mdx`, `id.mdx`). The `post_slug` is the **folder name only** — engagement (views, likes, comments) is **shared across all locales** of the same post.

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

## Auth — OAuth 2.0 (GitHub)

Server-side authorization code flow via Arctic. Only GitHub is supported.

### Start login

**`GET /auth/github/start`**

- Query: `return_to` — optional path on lxuu.dev to redirect after login (defaults to `/`).

**Behavior:**

1. Generate `state` via Arctic `generateState()`.
2. Store `state` in `oauth_state` httpOnly cookie; store `return_to` in `oauth_return` httpOnly cookie.
3. **`302`** redirect to GitHub authorize URL.

---

### OAuth callback (browser redirect endpoint)

**`GET /auth/github/callback`**

- Query params from GitHub: `code`, `state`.

**Behavior:**

1. Validate `state` against `oauth_state` cookie.
2. Exchange `code` for access token via Arctic.
3. Fetch GitHub user profile; upsert `users` + `oauth_accounts`.
4. Create **session** row; **`Set-Cookie`** (same-origin, `SameSite=Lax`):

   ```
   Set-Cookie: session=<opaque>; HttpOnly; Secure; Path=/; Max-Age=...; SameSite=Lax
   ```

5. **`302`** redirect to `return_to` from `oauth_return` cookie or `/`.

**Error:** `400` JSON `{ "error": "..." }`.

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
| `GET`    | `/auth/github/start`          | No       | Redirect to GitHub      |
| `GET`    | `/auth/github/callback`       | No       | OAuth callback          |
| `POST`   | `/auth/logout`                | Optional | Invalidate session      |
| `GET`    | `/auth/session`               | Optional | Session probe           |

---

## Out of scope (initial release)

- Nested comments, markdown bodies, moderation APIs, WebSockets, webhooks.
