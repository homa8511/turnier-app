import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config.mts';

// https://vitest.dev/config/
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      root: '.',
      setupFiles: [],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        exclude: [
          '**/node_modules/**',
          '**/.{eslint,prettier}rc.{js,cjs,json}',
          '**/{tailwind,postcss,vite,vitest}.config.*',
          '**/src/main.ts',
          '**/src/types.ts',
          '**/src/style.css',
          '**/dist/**',
          '**/*.spec.ts',
          '**/.husky/**',
          '**/src/**/tests/**',
        ],
      },
    },
  })
);
