# lxuu.dev

[![site](https://img.shields.io/badge/site-lxuu.dev-111111?style=flat-square)](https://lxuu.dev)
[![Astro](https://img.shields.io/badge/Astro-6-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

Personal site. The home page shows the GitHub profile, then projects, posts, the setup, and a page about me.

Astro and React, styled with Tailwind, deployed on Cloudflare. Writing lives in MDX through Keystatic. Comments and likes use Neon.

## Develop

Node 22.12 or newer, and pnpm.

```sh
pnpm install
cp .env.example .env
pnpm dev
```

Copy values from `.env.example`. The home page needs `GITHUB_USERNAME` and `GITHUB_TOKEN`. Comments and likes also need `DATABASE_URL`, `SESSION_SECRET`, and the GitHub OAuth pair.

```sh
pnpm test
pnpm lint
```
