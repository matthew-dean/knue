/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as O from 'vue-observables'
import { type Class } from 'type-fest'

export type * from 'vue-observables'
export type Extender<T extends O.Subscribable<any> = any, O = any> = (target: T, options: O) => T

export type AllModules = 'extenders' | 'mapping'

export interface VueKnockoutModule {
  name: AllModules
  init(): Record<string, any>
}

export interface VueKnockoutSubscribable<T> {
  extend(props: Record<string, any>): T
}

export interface Subscribable<T> extends O.Subscribable<T> {}

function Knue(...args: any[]) {
  function observable<T>(): O.Observable<T | undefined>
  function observable<T>(value: T): O.Observable<T>
  function observable<T>(value?: T) {
    return attachExtend(arguments.length === 0 ? O.observable<T>() : O.observable<T>(value!))
  }

  function extend<T extends O.Subscribable<any>, O = any>(target: T, options: O): T {

  }

  function attachExtend<T>(subscribable: T) {
    (subscribable as any).extend = (extender: Extender<T>) => {}
    return subscribable
  }
  // observable = O.observable
  // observableArray = O.observableArray
  // computed = O.computed
  // pureComputed = O.pureComputed
  // isObservable = O.isObservable
  // isWritableObservable = O.isWritableObservable
  // isComputed = O.isComputed
  // isPureComputed = O.isPureComputed

  const modules: {
    _extenders?: Record<string, Extender>
    _mapping?: Record<string, any>
  } = {}

  function use(module: VueKnockoutModule) {
    modules[`_${module.name}`] = module.init()
  }

  return {
    observable,
    observableArray: O.observableArray,
    computed: O.computed,
    pureComputed: O.pureComputed,
    isObservable: O.isObservable,
    isWritableObservable: O.isWritableObservable,
    isComputed: O.isComputed,
    isPureComputed: O.isPureComputed,
    use,
    get extenders(): Record<string, Extender> {
      if (!modules._extenders) {
        throw new Error('Extenders module has not been added.')
      }
      return modules._extenders
    },

    get mapping(): Record<string, any> {
      if (!modules._extenders) {
        throw new Error('Mapping module has not been added.')
      }
      return modules._extenders
    }
  }
}

/** Allow `new` keyword */
const VueKnockout = Knue as unknown as {
  new(): ReturnType<typeof Knue>
  (): ReturnType<typeof Knue>
}
export {
  VueKnockout as default
}

// export default VueKnockout()
