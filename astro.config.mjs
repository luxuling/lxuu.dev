// @ts-check
import { defineConfig, fontProviders, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import mdx from '@astrojs/mdx';
import keystatic from '@keystatic/astro';

import cloudflare from '@astrojs/cloudflare';

// NOTE: prerender runs in workerd, which reads vars only from .env files, and Workers Builds has none
if (process.env.WORKERS_CI)
  process.env.CLOUDFLARE_INCLUDE_PROCESS_ENV ??= 'true';

// NOTE: Keystatic needs Node's filesystem, so the dev server skips the workerd adapter to run it
const useKeystatic =
  process.argv.includes('dev') && !process.env.SKIP_KEYSTATIC;

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
    react(),
    markdoc(),
    mdx(),
    ...(useKeystatic ? [keystatic()] : []),
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

  adapter: useKeystatic ? undefined : cloudflare(),
});
