<script setup lang="ts">
import { model } from '../../model'
import { createValidator, createInitializer } from '../../adapters/valibot'
import { schema } from './schema'
import { type InferOutput } from 'valibot'
import Address from './address.vue'

type ViewModel = InferOutput<typeof schema>

const modelValue = defineModel<Partial<ViewModel>>({ required: true })

const vm = model<ViewModel>(modelValue, {
  validator: createValidator(schema),
  initializer: createInitializer(schema)
})
</script>

<template>
  <div
    v-for="(name, key) in [vm('name')]"
    :key
  >
    <label data-testid="name">{{ name.value }}</label>
    <input
      data-testid="name-input"
      v-model="name.value"
    />
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
    <input
      data-testid="age-input"
      v-model="age.value"
    />
    <div
      v-if="age.error"
      data-testid="age-error"
    >
      {{ age.error }}
    </div>
  </div>
  <Address v-model="vm('address').value" />
  <button
    data-testid="main-submit"
    type="button"
    @click="vm.validate()"
  >
    Validate Main
  </button>
</template>
