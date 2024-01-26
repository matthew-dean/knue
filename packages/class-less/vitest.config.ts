import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'class-less',
    watch: false,
    include: ['src/__tests__/**/*.ts']
  }
})
