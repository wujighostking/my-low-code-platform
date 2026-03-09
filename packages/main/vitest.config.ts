import { playwright } from '@vitest/browser-playwright'
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    name: 'main',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    browser: {
      enabled: true,
      headless: !true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
}))
