import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'html'],
      include: ['lib/src/**'],
      exclude: [
        'lib/src/**/types.ts',
        'lib/src/types/**',
        'lib/src/**/__tests__/**',
        'lib/src/**/*.d.ts',
      ],
    },
  },
});

