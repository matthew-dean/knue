import { describe, test, expect, vi } from 'vitest'
import Knue from '..'
// import '../modules/extenders'
import { extenders, type Extender } from '../modules/extenders'
import { type Subscribable } from 'vue-observables'

const extender = {
  numericText: <S extends Subscribable<any>>(target: S, data: string): S => {
    return target
  }
}

type Foo = typeof extender['numericText'] extends Extender<infer T, infer O, infer R> ? Extender<T, O, R> : never

const ko = new Knue([
  extenders(extender)
])

/**
 * @note - We shouldn't have to test observable behavior,
 * we're just testing that it's on the ko object.
 */
describe('sanity check', () => {
  test('observable', () => {
    const obs = ko.observable(1).extend({ numericText: 'test' })
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
