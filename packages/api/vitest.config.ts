import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      include: ['src/modules/**/*.ts'],
      exclude: [
        'src/modules/**/__tests__/**',
        'src/modules/**/dto.ts',
        'src/modules/**/routes.ts',
        'src/modules/**/validation.ts',
        'src/test/**',
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
