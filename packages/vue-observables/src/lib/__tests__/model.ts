import { describe, test, expect, vi } from 'vitest'
import {
  model
} from '../model'
import { createValidator } from '../../adapters/valibot'
import { object, string, number, type InferOutput, array } from 'valibot'
import { reactive, watch, nextTick, ref } from 'vue'
import { flushPromises, mount, type DOMWrapper } from '@vue/test-utils'
import Component from './__helpers/component.vue'

describe('Model API', () => {
  test('model', async () => {
    interface MyModel {
      name: string
      age: number
      nested?: {
        foo: string
      }
    }
    const state = model<MyModel>({})
    watch(state('name').ref, name => {
      expect(name).toBe('John')
    })
    watch(state.ref, value => {
      expect(value.name).toBe('John')
    })
    state('name').value = 'John'
    state('age')(30)
    await flushPromises()
    expect(state()).toEqual({ name: 'John', age: 30 })
    expect(state('age')()).toBe(30)
  })

  test('nested reactivity', async () => {
    interface MyModel {
      nested: {
        foo: string
      }
    }
    const state = model<MyModel>({
      nested: { foo: '' }
    })
    let watchTriggered = false
    watch(() => state('nested').value.foo, name => {
      watchTriggered = true
      expect(name).toBe('bar')
    })
    state('nested').value.foo = 'bar'
    await flushPromises()
    expect(state()).toEqual({ nested: { foo: 'bar' } })
    expect(watchTriggered).toBe(true)
  })

  test('validation', async () => {
    const schema = object({
      name: string(),
      age: number(),
      destinations: array(object({
        place: number()
      }))
    })
    type MyModel = InferOutput<typeof schema>
    const existingRef = ref<Partial<MyModel>>({
      name: 'John',
      destinations: [
        { place: 1 },
        { place: 2 },
        { place: 3 }
      ]
    })

    const state = model<MyModel>(existingRef, {
      validator: createValidator(schema),
      validateOnMount: true
    })
    await flushPromises()
    expect(state.isValid).toBe(false)
    expect(state.validatedValue).toBeUndefined()
    state('name').value = 'John'
    state('age').value = 30
    const destinations = state('destinations')
    // state('destinations').value = []
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    destinations.value
    expect(state()).toEqual({
      name: 'John',
      age: 30,
      destinations: [
        { place: 1 },
        { place: 2 },
        { place: 3 }
      ]
    })
    let existingRefChangeDetected = false
    let internalRefChangeDetected = false
    watch(() => existingRef.value.destinations, value => {
      existingRefChangeDetected = true
      expect(value).toEqual([])
    })
    watch(() => destinations.value, value => {
      internalRefChangeDetected = true
      expect(value).toEqual([])
    })
    destinations.value = []
    state.validate()
    await flushPromises()
    await nextTick()
    expect(state.isValid).toBe(true)
    expect(state.validatedValue).toEqual({
      name: 'John',
      age: 30,
      destinations: []
    })
    expect(existingRef.value).toEqual({
      name: 'John',
      age: 30,
      destinations: []
    })
    expect(existingRefChangeDetected).toBe(true)
    expect(internalRefChangeDetected).toBe(true)
  })

  test('component binding', async () => {
    const wrapper = mount(Component, {
      props: {
        modelValue: reactive({
          name: 'barney',
          destinations: [
            { place: 1 },
            { place: 2 },
            { place: 3 }
          ]
        })
      }
    })
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
