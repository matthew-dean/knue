import { describe, test, expect, vi } from 'vitest'
import {
  observable,
  observableArray,
  computed,
  isObservable,
  isComputed,
  isWritableObservable,
  isObservableArray
} from '..'
import { watch, nextTick } from 'vue'

describe('basic API', () => {
  test('observable', () => {
    const obs = observable(1)
    expect(obs()).toBe(1)
    expect(obs.getDependenciesCount()).toBe(0)
    obs(2)
    expect(obs()).toBe(2)
    expect(isObservable(obs)).toBe(true)
    expect(isComputed(obs)).toBe(false)
    expect(isWritableObservable(obs)).toBe(true)
    expect(isObservableArray(obs)).toBe(false)
  })

  test('silent update', () => {
    const obs = observable(1)
    const com = computed(() => obs() + 1)
    expect(obs()).toBe(1)
    expect(com()).toBe(2)
    obs.silentSet(10)
    expect(obs()).toBe(10)
    expect(com()).toBe(2)
    obs(20)
    expect(obs()).toBe(20)
    expect(com()).toBe(21)
  })

  test('observableArray', () => {
    const obs = observableArray([1])
    expect(obs()).toEqual([1])
    obs().push(2)
    expect(obs()).toEqual([1, 2])
    obs.push(3)
    expect(obs()).toEqual([1, 2, 3])
    expect(isObservable(obs)).toBe(true)
    expect(isComputed(obs)).toBe(false)
    expect(isWritableObservable(obs)).toBe(true)
    expect(isObservableArray(obs)).toBe(true)

    // Test array methods on root observable
    expect(obs.length).toBe(3)
    expect(obs.map(i => i)).toEqual(obs())
    expect(obs[0]).toBe(1)
    expect(obs[9]).toBe(undefined)

    // Knockout-specific
    obs.removeAll()
    expect(obs()).toEqual([])
    obs.push(1, 2, 3)
    expect(obs()).toEqual([1, 2, 3])
    let removed = obs.remove(2)
    expect(obs()).toEqual([1, 3])
    expect(removed).toEqual([2])
    removed = obs.remove((item) => item === 3)
    expect(obs()).toEqual([1])
    expect(removed).toEqual([3])
  })

  test('test that Vue doesn\'t auto-unwrap', () => {
    const obs = observable({
      foo: observable(1)
    })
    expect(obs().foo()).toBe(1)
  })

  // test('knockout-specific array functions', () => {
  //   const obs = observableArray([1, 2])
  // })

  test('computed', () => {
    const obs = computed(() => 1)
    expect(obs()).toBe(1)
    expect(isObservable(obs)).toBe(true)
    expect(isComputed(obs)).toBe(true)
    expect(isWritableObservable(obs)).toBe(false)
  })

  test('computed with options', () => {
    const obs = computed({
      get: () => 1,
      set: () => {}
    })
    expect(obs()).toBe(1)
    expect(isObservable(obs)).toBe(true)
    expect(isComputed(obs)).toBe(true)
    expect(isWritableObservable(obs)).toBe(true)
  })
})

describe('test un-tracking', () => {
  test('observable peek()', () => {
    const obs = observable(1)
    expect(obs.peek()).toBe(1)
    obs(2)
    expect(obs.peek()).toBe(2)
    const comp = computed(() => obs.peek() + 1)
    expect(comp()).toBe(3)
    obs(3)
    expect(comp()).toBe(3)
  })

  test('computed peek()', () => {
    const obs = observable(1)
    const obs2 = observable(10)
    const comp1 = computed(() => obs() + 1)
    const comp2 = computed(() => comp1.peek() + obs2())
    expect(obs()).toBe(1)
    expect(comp1()).toBe(2)
    expect(comp2()).toBe(12)
    obs(2)
    expect(obs()).toBe(2)
    expect(comp1()).toBe(3)
    expect(comp2()).toBe(12)
    /** This DOES trigger a recalculation, which recalculates comp1 */
    obs2(11)
    expect(comp2()).toBe(14)
  })
})

describe('test subscriptions', () => {
  test('observable', async () => {
    const obs = observable(1)
    const spy = vi.fn().mockImplementation((val) => {
      expect(val).toBe(obs())
    })
    obs.subscribe(spy)
    watch(obs, spy)
    expect(obs.getDependenciesCount()).toBe(2)
    obs(2)
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(2)
    obs.dispose()
    expect(obs.getDependenciesCount()).toBe(0)
    obs(3)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  test('computed', async () => {
    const obs = observable(1)
    const comp = computed(() => obs() + 1)
    const spy = vi.fn().mockImplementation((val) => {
      expect(val).toBe(comp())
    })
    comp.subscribe(spy)
    watch(comp, spy)
    expect(comp.getDependenciesCount()).toBe(2)
    obs(2)
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
