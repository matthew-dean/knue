<script setup lang="ts">
import { model } from '../src'
import { object, string, number, pipe, nonEmpty, trim, type InferOutput } from 'valibot'
import { validate } from '../src/adapters/valibot'

const schema = object({
  name: pipe(string(), trim(), nonEmpty('Name is required')),
  age: number()
})

type ViewModel = InferOutput<typeof schema>

const vm = model<ViewModel>({
  name: '',
  age: 30
}, validate(schema), {})
</script>

<template>
  <main>
    <div>
      <p>Name: {{ vm('name').value }}</p>
      <input v-model="vm('name').value" />
      <div
        class="error"
        v-if="vm('name').error"
      >
        {{ vm('name').error }}
      </div>
    </div>

    <div>
      <p>Age: {{ vm('age').value }}</p>
      <input
        type="number"
        v-model="vm('age').value"
      />
      <div
        class="error"
        v-if="vm('age').error"
      >
        {{ vm('age').error }}
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  max-width: 30ch;
  margin: 0 auto;
  border: 1px solid #ccc;
  padding: 1em;
}
</style>
