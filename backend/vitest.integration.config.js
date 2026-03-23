import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/integration/**/*.test.js'],
    // forks: {
    //   singleFork: true, // run all tests in the same process sequentially
    // },
    // Simplified for now — let vitest handle it
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    sequence: {
      concurrent: false,
    },
    testTimeout: 20000,
    hookTimeout: 20000,
    env: {
      NODE_ENV: 'test',
    },
  },
});
