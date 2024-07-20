<script setup lang="ts">
import { model } from '../model'
import { validate } from '../adapters/valibot'

import { object, string, number, type InferOutput } from 'valibot'

const schema = object({
  name: string(),
  age: number()
})

type ViewModel = InferOutput<typeof schema>

const modelValue = defineModel<Partial<ViewModel>>({ required: true })

const vm = model<ViewModel>(modelValue, obj => validate(obj, schema))
</script>

<template>
  <div
    v-for="(name, key) in [vm('name')]"
    :key
  >
    <label data-testid="name">{{ name.value }}</label>
    <input v-model="name.value" />
    <div
      v-if="name.error"
      data-testid="name-error"
    >
      {{ name.error }}
    </div>
  </div>

  <div
    v-for="(age, key) in [vm('age')]"
    :key
  >
    <label data-testid="age">{{ age.value }}</label>
    <input v-model="age.value" />
    <div
      v-if="age.error"
      data-testid="age-error"
    >
      {{ age.error }}
    </div>
  </div>
</template>
