import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  {
    // don't lint the config itself
    ignores: ['eslint.config.*', 'dist/**', 'coverage/**', 'node_modules/**', '**/*.d.ts'],
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    languageOptions: { globals: globals.node },
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ['**/*.{ts,tsx,js,cjs,mjs}'], // only /src since config lives here
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: srcDir,
        // If you DO want to lint root-level scripts/configs later, uncomment:
        // projectService: { allowDefaultProject: ['*.{js,cjs,mjs,ts}'] },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    },
  },

  // optional: looser rules + jest globals for tests
  {
    files: ['**/*.{spec,test}.{ts,tsx,js}'],
    languageOptions: { globals: { ...globals.jest } },
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  }
);