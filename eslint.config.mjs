import eslint from '@eslint/js';
import * as typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import pluginReact from 'eslint-plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/build/**',
      '**/dist/**',
      '**/out/**',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/*.bundled.js',
      '**/static/js/*',
      '**/static/css/*',
      'packages/*/build/**',
      'packages/*/dist/**',
      'node_modules',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/.vercel/**',
      '**/public/**',
      '**/*.d.ts',
    ],
  },
  eslint.configs.recommended,
  // JavaScript-specific configuration (no TypeScript)
  {
    files: ['**/*.{js,jsx,cjs,mjs}'],
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: pluginReact,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
        },
        {
          selector: 'import',
          format: null,
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['class', 'interface', 'typeAlias', 'enum'],
          format: ['PascalCase'],
        },
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
          prefix: ['T'],
        },
        {
          selector: 'method',
          format: ['camelCase'],
        },
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase', 'camelCase'],
          prefix: ['is', 'has', 'should', 'can', 'will'],
        },
        {
          selector: 'function',
          filter: {
            regex: '^use[A-Z]',
            match: true,
          },
          format: ['camelCase'],
          prefix: ['use'],
        },
        {
          selector: 'function',
          filter: {
            regex: '^handle[A-Z]',
            match: true,
          },
          format: ['camelCase'],
          prefix: ['handle'],
        },
      ],
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: pluginReact,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
];
