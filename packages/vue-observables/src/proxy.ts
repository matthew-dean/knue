/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  type Ref,
  type ShallowRef,
  type ComputedRef,
  type WritableComputedRef,
  shallowReactive,
  watch
} from 'vue'
import { type Subscribable, type SubscribableFn } from '.'
import { ReactiveFlags, EXTENDERS_KEY } from './constants'
import remove from 'lodash-es/remove'

export const COMPUTED = Symbol('computed')
export const OBSERVABLE = Symbol('observable')
export const SUBSCRIBERS = Symbol('subscribers')

export type RefLike<T> = ShallowRef<T> | ComputedRef<T> | WritableComputedRef<T>

const { isArray } = Array

/**
 * Mimics Knockout's API for getting / setting
 */
export const getProxy = <T, V extends RefLike<T> = RefLike<T>>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vueObj: V,
  constructorFn: SubscribableFn,
  computed: boolean = false
) => {
  function setValue(value: any, silent: boolean = false) {
    if (!(vueObj as any)[ReactiveFlags.IS_READONLY]) {
      value = typeof value === 'object' && value !== null
        ? shallowReactive(value)
        : value
      if (silent) {
        (vueObj as any)._value = value
        return
      }
      ;(vueObj as Ref).value = value
    } else {
      throw new Error('Cannot set value on a read-only observable')
    }
  }

  function getterSetter(): T
  function getterSetter(value: T): void
  function getterSetter(value?: T) {
    if (arguments.length === 0) {
      return vueObj.value
    }
    setValue(value)
  }

  function subscribe(
    callback: (newValue: T) => void,
    callbackTarget?: any,
    // ?
    event?: string
  ) {
    if (callbackTarget) {
      callback = callback.bind(callbackTarget)
    }
    watch(vueObj, callback)
  }

  Object.defineProperties(getterSetter, {
    [OBSERVABLE]: {
      value: true
    },
    [COMPUTED]: {
      value: computed
    },
    subscribe: {
      value: subscribe
    }
  })

  const proxyHandler: ProxyHandler<any> = {
    get(target, p: string) {
      const currentVal = (vueObj as any)._value
      /** Knockout API */
      switch (p) {
        case 'bind':
          /**
           * Make sure that re-bound functions are also wrapped in this proxy
           */
          return function(thisVal: any) {
            return new Proxy(getterSetter.bind(thisVal), proxyHandler)
          }
        case 'peek':
          /** Peek at the private Vue value */
          return () => currentVal
        case 'getDependenciesCount':
          return () => (vueObj as any).dep?.size ?? 0
        case 'dispose':
          return () => {
            const deps = (vueObj as any).dep
            if (deps) {
              deps.cleanup()
            }
          }
        /** Additional API */
        case 'silentSet':
          return (value: T) => { setValue(value, true) }
      }

      /** In Knockout, array functions are available on the observable */
      if (isArray(currentVal)) {
        if (p in Array.prototype) {
          return Array.prototype[p as keyof any[]].bind(currentVal)
        }
        switch (p) {
          case 'removeAll':
            return () => {
              currentVal.length = 0
            }
          case 'reversed':
            return () => currentVal.slice().reverse()
          /** @todo - get working later */
          case 'remove':
            return (itemOrFunc: any) => {
              if (typeof itemOrFunc === 'function') {
                return remove(currentVal, itemOrFunc as Parameters<typeof remove>[1])
              }
              return remove(currentVal, item => item === itemOrFunc)
            }
        }
      }

      for (const extenders of constructorFn[EXTENDERS_KEY]) {
        if (p in extenders) {
          const value = extenders[p]
          if (typeof value === 'function') {
            return value.bind(proxiedValue)
          }
          return value
        }
      }

      for (const extenders of constructorFn[EXTENDERS_KEY]) {
        if (p in extenders) {
          const value = extenders[p]
          if (typeof value === 'function') {
            return value.bind(proxiedValue)
          }
          return value
        }
      }
      /**
       * Return all Vue ref properties, so that they
       * can be tested with other Vue utilities.
       */
      // eslint-disable-next-line vue/no-ref-as-operand
      if (p in vueObj) {
        return vueObj[p as keyof typeof vueObj]
      }
      /** Return any arbitrary props */
      if (p in target) {
        return target[p]
      }
    },
    set(target, p, value) {
      if (p === 'value') {
        setValue(value)
      }
      /**
       * As far as I know, `value` should be the only
       * writeable property on a Vue ref. Everything
       * else is arbitrary, so we'll set it on the
       * getterSetter function
       */
      target[p] = value
      return true
    },
    has(target, p) {
      if (p in Array.prototype && isArray((vueObj as any)._value)) {
        return true
      }
      return p in vueObj || p in target
    }
  }

  const proxiedValue = new Proxy(getterSetter, proxyHandler) as Subscribable<T>

  return proxiedValue
}
