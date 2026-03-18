import defineConfig from '@antfu/eslint-config'
import reactCompiler from 'eslint-plugin-react-compiler'

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
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'no-console': 'warn',
      'react-compiler/react-compiler': 'warn',
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
