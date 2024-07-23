import { defineWorkspace } from 'vitest/config'
export default defineWorkspace([
  'packages/*/vitest.config.ts',
  'packages/*/vite.config.ts',
  {
    test: {
    }
  }
])
