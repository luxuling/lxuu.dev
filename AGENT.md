# Agent Rules

This project uses the following development rules:

1. Keep architecture simple and clean:
   - Separate UI, logic, and data concerns.
   - Keep modules focused and easy to maintain.
   - Avoid unnecessary abstractions and complexity.

2. Use kebab-case for all file and folder names:
   - Example: `hero-section.astro`
   - Example: `theme-toggle.tsx`

3. Use only Astro and SolidJS:
   - Astro for pages/layout structure.
   - SolidJS for interactive components.
   - Do not introduce other UI frameworks.

4. No unnecessary comments in code:
   - Do not add comments that narrate what the code does (e.g. "// Import the module", "// Define the function").
   - Only comment non-obvious intent, trade-offs, or constraints the code cannot convey on its own.
   - Never explain a change being made in a comment.

5. Always consult `docs/`:
   - Before implementing or changing a feature, read the relevant files in `docs/` for specs, API contracts, and ERDs.
   - Treat `docs/` as the source of truth for requirements and data models.
   - Keep `docs/` up to date when behavior, contracts, or schemas change.

6. Project context:
   - This project is personal portfolio website for owner.
   - Keep style minimal, solid color surfaces, no decorative background patterns.
   - Prefer reusable layout and base components for consistency.

7. Stack:
   - **Astro 6** (SSR via Vercel adapter, `prerender = false` on all routes)
   - **SolidJS** for interactive components
   - **Keystatic CMS** (local storage mode) — content lives in `content/posts/*.mdx` and `content/projects/*.mdx`; admin UI at `/keystatic`
   - **Astro Content Collections** (`src/content.config.ts`) with `glob` loader reading MDX files
   - **Neon PostgreSQL** via `@neondatabase/serverless` HTTP driver (required for Vercel serverless)
   - **Drizzle ORM** — schema at `src/lib/db/schema.ts`, migrations at `src/lib/db/migrations/`
   - **Arctic** for GitHub OAuth (server-side auth code flow, httpOnly session cookies)
   - Engagement API routes at `src/pages/api/` (same-origin, no external service)
