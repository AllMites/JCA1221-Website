import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // liquidGL.js is vendored third-party code (naughtyduk/liquidGL); its style is not ours to gate.
  globalIgnores(['dist', '.claude/**', 'public/scripts/liquidGL.js']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // gates/*.js: CommonJS scripts (require/module.exports), run under Node.
    files: ['gates/**/*.{js,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    // public/sw.js: the service worker, runs in its own worker global scope, not the DOM.
    files: ['public/sw.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: { ...globals.serviceworker, ...globals.browser },
    },
  },
  {
    // Everything else plain-JS (this repo's own ESM tooling scripts, e.g. eslint.config.js itself).
    files: ['**/*.{js,jsx,mjs}'],
    ignores: ['gates/**', 'public/**'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.node,
    },
  },
])
