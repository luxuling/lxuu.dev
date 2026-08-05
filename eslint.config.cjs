const js = require('@eslint/js');
const eslintPluginAstro = require('eslint-plugin-astro');
const eslintPluginSolid = require('eslint-plugin-solid');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
  js.configs.recommended,
  ...eslintPluginAstro.configs['flat/recommended'],
  {
    files: ['astro.config.mjs', 'drizzle.config.ts', 'keystatic.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{tsx,jsx}'],
    ...eslintPluginSolid.configs['flat/typescript'],
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
