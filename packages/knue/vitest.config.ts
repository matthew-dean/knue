import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'knue',
    watch: false,
    include: ['src/__tests__/**/*.ts']
  }
})
