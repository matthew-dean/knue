import { describe, test, expect, vi } from 'vitest'
import {
  model
} from '../model'
import { createValidator } from '../../adapters/valibot'
import { object, string, number, type InferOutput } from 'valibot'
import { nextTick } from 'vue'
import { flushPromises, mount, type DOMWrapper } from '@vue/test-utils'
import Component from './__helpers/component.vue'

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
    const state = model<MyModel>({}, {
      validator: createValidator(schema),
      validateOnMount: true
    })
    await flushPromises()
    expect(state.isValid).toBe(false)
    expect(state.validatedValue).toBeUndefined()
    state('name').value = 'John'
    state('age').value = 30
    expect(state()).toEqual({ name: 'John', age: 30 })
    state.validate()
    await flushPromises()
    expect(state.isValid).toBe(true)
    expect(state.validatedValue).toEqual({ name: 'John', age: 30 })
  })

  test('component binding', async () => {
    const wrapper = mount(Component, { props: { modelValue: { name: 'barney' } } })
    const nameInput: DOMWrapper<HTMLInputElement> = wrapper.find('input[data-testid="name-input"]')
    const ageInput: DOMWrapper<HTMLInputElement> = wrapper.find('input[data-testid="age-input"]')
    nameInput.element.value = 'barney'
    let button: DOMWrapper<HTMLButtonElement> = wrapper.find('button[data-testid="main-submit"]')
    button.element.click()
    await flushPromises()
    expect(nameInput.element.value).toBe('barney')
    expect(wrapper.find('[data-testid="name-error"]').exists()).toBe(false)
    /** The model doesn't have age defined. */
    expect(wrapper.find('[data-testid="age-error"]').exists()).toBe(true)

    /** The inner component has its own tracked model so it isn't validated internally yet */
    expect(wrapper.find('[data-testid="state-error"]').exists()).toBe(false)
    button = wrapper.find('button[data-testid="address-submit"]')
    button.element.click()
    await flushPromises()
    expect(wrapper.find('[data-testid="state-error"]').exists()).toBe(true)
  })
})
