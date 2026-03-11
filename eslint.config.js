import defineConfig from '@antfu/eslint-config'

export default defineConfig(
  {
    formatters: true,
    unocss: true,
    react: true,
    pnpm: true,
    typescript: true,
    ignores: ['.codex'],
  },
  {
    rules: {
      'no-console': 'warn',
    },
  },
)
