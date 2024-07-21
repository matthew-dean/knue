import { describe, test, expect, vi } from 'vitest'
import {
  model
} from '../model'
import { validate } from '../adapters/valibot'
import { object, string, number, type InferOutput } from 'valibot'
import { nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import Component from './component.vue'

describe('Model API', () => {
  test('model', () => {
    interface MyModel {
      name: string
      age: number
    }
    const state = model<MyModel>({})
    state('name').value = 'John'
    state('age').value = 30
    expect(state()).toEqual({ name: 'John', age: 30 })
  })

  test('validation', async () => {
    const schema = object({
      name: string(),
      age: number()
    })
    type MyModel = InferOutput<typeof schema>
    const state = model<MyModel>({}, validate(schema))
    await flushPromises()
    expect(state.isValid).toBe(false)
    expect(state.validatedValue).toBeUndefined()
    state('name').value = 'John'
    state('age').value = 30
    expect(state()).toEqual({ name: 'John', age: 30 })
    await flushPromises()
    expect(state.isValid).toBe(true)
    expect(state.validatedValue).toEqual({ name: 'John', age: 30 })
  })

  test('component binding', async () => {
    const wrapper = mount(Component, { props: { modelValue: { name: 'barney' } } })
    await flushPromises()
    await nextTick()
    expect(wrapper.find('input').element.value).toBe('barney')
    expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(false)
    /** The model doesn't have age defined. */
    expect(wrapper.find('[data-testid="age-error"]').exists()).toBe(true)
  })
})
