import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'vue-observables',
    watch: false,
    include: ['src/__tests__/**/*.ts']
  }
})
