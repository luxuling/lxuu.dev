const js = require('@eslint/js');
const eslintPluginAstro = require('eslint-plugin-astro');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**', '.vercel/**'],
  },
  js.configs.recommended,
  ...eslintPluginAstro.configs['flat/recommended'],
  {
    files: ['astro.config.mjs', 'drizzle.config.ts', 'keystatic.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{tsx,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
  },
];
