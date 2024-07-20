import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    name: 'vue-observables',
    watch: false,
    environment: 'happy-dom',
    include: ['src/__tests__/**/*.ts']
  }
})
