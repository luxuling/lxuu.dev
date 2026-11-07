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

const keystaticEditorStyles = {
  name: 'keystatic-editor-styles',
  hooks: {
    'astro:config:setup': ({ injectScript }) =>
      injectScript('before-hydration', "import '/src/styles/keystatic.css';"),
  },
};

// https://astro.build/config
export default defineConfig({
  // Astro 7 defaults this to 'jsx', which drops spaces between inline elements
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
    // HACK: Vite 8 answers /@id/astro/runtime/client/dev-toolbar/entrypoint.js
    // with 504 after that module is prebundled. The file is current; only the
    // hash on the cached module id is stale.
    optimizeDeps: {
      ignoreOutdatedRequests: true,
    },
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Maple Mono',
      cssVariable: '--font-maple-mono',
      weights: [400, 600, 700],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
    },
  ],

  integrations: [
    react(),
    markdoc(),
    mdx(),
    ...(useKeystatic ? [keystatic(), keystaticEditorStyles] : []),
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
