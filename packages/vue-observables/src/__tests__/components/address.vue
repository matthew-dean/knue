<script setup lang="ts">
import { model } from '../../model'
import { createValidator } from '../../adapters/valibot'
import { schema } from './schema'
import { type InferOutput } from 'valibot'

const addressSchema = schema.entries.address

type ViewModel = InferOutput<typeof addressSchema>

const modelValue = defineModel<Partial<ViewModel>>({ required: true })

const vm = model<ViewModel>(modelValue, {
  validator: createValidator(addressSchema)
})
</script>

<template>
  <div
    v-for="(city, key) in [vm('city')]"
    :key
  >
    <label data-testid="city">{{ city.value }}</label>
    <input
      data-testid="city-input"
      v-model="city.value"
    />
    <div
      v-if="city.error"
      data-testid="city-error"
    >
      {{ city.error }}
    </div>
  </div>

  <div
    v-for="(state, key) in [vm('state')]"
    :key
  >
    <label data-testid="state">{{ state.value }}</label>
    <input
      data-testid="state-input"
      v-model="state.value"
    />
    <div
      v-if="state.error"
      data-testid="state-error"
    >
      {{ state.error }}
    </div>
  </div>
  <button
    data-testid="address-submit"
    type="button"
    @click="vm.validate()"
  >
    Validate Address
  </button>
</template>
