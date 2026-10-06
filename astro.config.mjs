// @ts-check
import { defineConfig, fontProviders, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import solidJs from '@astrojs/solid-js';

import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import mdx from '@astrojs/mdx';
import keystatic from '@keystatic/astro';

import cloudflare from '@astrojs/cloudflare';

// Prerender runs in workerd, which only reads vars from .env/.dev.vars. On
// Cloudflare Workers Builds there is no .env, so pass the build variables in.
if (process.env.WORKERS_CI)
  process.env.CLOUDFLARE_INCLUDE_PROCESS_ENV ??= 'true';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Maple Mono',
      cssVariable: '--font-maple-mono',
    },
  ],

  integrations: [
    solidJs({ include: ['src/**/*'] }),
    react({ include: ['**/keystatic/**/*'] }),
    markdoc(),
    mdx(),
    // WORKERS_CI is set by Cloudflare Workers Builds; Keystatic can't bundle for workerd
    ...(process.env.SKIP_KEYSTATIC || process.env.WORKERS_CI
      ? []
      : [keystatic()]),
  ],

  env: {
    schema: {
      DATABASE_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      SESSION_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      GITHUB_CLIENT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      GITHUB_CLIENT_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      GITHUB_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      GITHUB_USERNAME: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },

  adapter: cloudflare(),
});
