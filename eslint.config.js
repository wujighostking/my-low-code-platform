import defineConfig from '@antfu/eslint-config'

export default defineConfig(
  {
    formatters: true,
    unocss: true,
    react: true,
    pnpm: true,
    typescript: true,
    ignores: ['.codex', '.claude'],
  },
  {
    rules: {
      'no-console': 'warn',
    },
  },
  {
    files: ['packages/nest/**/*.ts'],
    rules: {
      'ts/consistent-type-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
)
