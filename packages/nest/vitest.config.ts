import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    name: 'nest',
    include: ['src/**/*.{test,spec}.ts'],
    globals: true,
    environment: 'node',
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts'],
    },
  },
})
