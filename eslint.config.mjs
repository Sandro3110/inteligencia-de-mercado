import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // Configuração base do ESLint
  js.configs.recommended,
  // Configuração para TypeScript e React
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
    },
    rules: {
      // Desabilitar regras que causam falsos positivos
      'no-undef': 'off', // TypeScript já verifica isso
      'no-unused-vars': 'off', // Usar regra do TypeScript

      // TypeScript Rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',

      // React Rules
      'react/react-in-jsx-scope': 'off', // React 17+
      'react/prop-types': 'off', // TypeScript handles this
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General Rules
      'no-console': 'off', // Permitir console.log em desenvolvimento
      'no-debugger': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-throw-literal': 'error',
      'no-case-declarations': 'warn',
      'no-useless-escape': 'warn',
    },
  },
  // Ignorar arquivos
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.manus/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '.eslintrc.json',
      'patches/**',
      // Arquivos de teste
      '*.test.ts',
      '*.test.tsx',
      'server/__tests__/**',
      // Scripts utilitários (não fazem parte da aplicação)
      '*.mjs',
      '*.cjs',
      'test-*.ts',
      'validate-*.ts',
      'analyze-*.ts',
      'audit-*.ts',
      'clean-*.ts',
      'fix-*.ts',
      'check-*.ts',
    ],
  },
];
