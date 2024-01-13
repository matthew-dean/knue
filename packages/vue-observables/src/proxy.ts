/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  type Ref,
  type ComputedRef,
  type WritableComputedRef,
  watch
} from 'vue'
import { type Subscribable } from '.'
import { ReactiveFlags } from './constants'

export const COMPUTED = Symbol('computed')
export const OBSERVABLE = Symbol('observable')
export const SUBSCRIBERS = Symbol('subscribers')

export type RefLike<T> = ComputedRef<T> | WritableComputedRef<T>

/**
 * Mimics Knockout's API for getting / setting
 */
export const getProxy = <T, V extends RefLike<T> = RefLike<T>>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vueObj: V,
  computed: boolean = false
) => {
  function setValue(value: any) {
    if (!(vueObj as any)[ReactiveFlags.IS_READONLY]) {
      (vueObj as Ref).value = value
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
    const handle = watch(vueObj, callback)
    ;(getterSetter as any)[SUBSCRIBERS].add(handle)
  }

  Object.defineProperties(getterSetter, {
    [SUBSCRIBERS]: {
      value: new Set()
    },
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
    get(target, p) {
      if (p === 'bind') {
        /**
         * Make sure that re-bound functions are also wrapped in this proxy
         */
        return function(thisVal: any) {
          return new Proxy(getterSetter.bind(thisVal), proxyHandler)
        }
      }
      if (p === 'peek') {
        /** Peek at the private Vue value */
        return () => (vueObj as any)._value
      }
      if (p === 'getDependenciesCount') {
        return () => (vueObj as any).dep?.size ?? 0
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
      return p in vueObj || p in target
    }
  }

  return new Proxy(getterSetter, proxyHandler) as Subscribable<T>
}
