/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  type Ref,
  type ComputedRef,
  type WritableComputedRef
} from 'vue'
import { type refWithControl } from '@vueuse/core'

const WRITABLE = Symbol('writable')

export type ControlledRef<T> = ReturnType<typeof refWithControl<T>>
export type RefLike<T> = ControlledRef<T> | ComputedRef<T> | WritableComputedRef<T>

type ProxyReturn<T> =
  T extends ControlledRef<infer U>
    ? ControlledRef<U>
    : T extends ComputedRef<infer U>
      ? ComputedRef<U>
      : T extends WritableComputedRef<infer U>
        ? WritableComputedRef<U>
        : never
/**
 * Mimics Knockout's API for getting / setting
 */
export const getProxy = <T, V extends RefLike<T> = RefLike<T>>(
  vueObj: V,
  writable: boolean = true
) => {
  function setValue(value: any) {
    if (writable) {
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

  Object.defineProperty(getterSetter, WRITABLE, {
    value: writable
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

  return new Proxy(getterSetter, proxyHandler) as ProxyReturn<V>
}
