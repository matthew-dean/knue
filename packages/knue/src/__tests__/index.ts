import { describe, test, expect, vi } from 'vitest'
import Knue from '..'
// import '../modules/extenders'
import { extenders } from '../modules/extenders'

const ko = new Knue({ extenders })

/**
 * @note - We shouldn't have to test observable behavior,
 * we're just testing that it's on the ko object.
 */
describe('sanity check', () => {
  test('observable', () => {
    const obs = ko.observable(1)
    console.log(obs.foo)
    expect(obs()).toBe(1)
  })

  test('observableArray', () => {
    const obs = ko.observableArray([1])
    expect(obs()).toEqual([1])
  })

  test('computed', () => {
    const obs = ko.computed(() => 1)
    expect(obs()).toBe(1)
  })
})
