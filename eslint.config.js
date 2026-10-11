import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      '**/dist',
      // Widgets lint themselves with their own ESLint configs.
      'widgets/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      // Prop types are already enforced by the TypeScript compiler.
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.config.{js,ts}', '.prettierrc.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // Component library consumed by widgets - fast refresh does not apply.
    files: ['packages/ui/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
