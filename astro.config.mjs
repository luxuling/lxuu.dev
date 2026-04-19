// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import solidJs from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Maple Mono",
      cssVariable: "--font-maple-mono",
    },
  ],
  integrations: [solidJs()]
});
