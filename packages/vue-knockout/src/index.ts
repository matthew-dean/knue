/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as O from 'vue-observables'

export type * from 'vue-observables'
export type Extender<T extends O.Subscribable<any> = any, O = any> = (target: T, options: O) => T

export interface VueKnockoutModule {
  name: 'extenders' | 'mapping'
  init(): Record<string, any>
}

export interface VueKnockoutSubscribable<T> {
  extend(props: Record<string, any>): T
}

export interface Subscribable<T> extends O.Subscribable<T> {}

export class VueKnockout {
  // observable<T>(): O.Observable<T | undefined>
  // observable<T>(value: T): O.Observable<T>
  // observable<T>(value?: T) {
  //   return this.addExtend(arguments.length === 0 ? O.observable<T>() : O.observable<T>(value!))
  // }

  // private addExtend<T>(subscribable: T) {
  //   (subscribable as any).extend = (extender: Extender<T>) => {}
  //   return subscribable
  // }
  observable = O.observable
  observableArray = O.observableArray
  computed = O.computed
  pureComputed = O.pureComputed
  isObservable = O.isObservable
  isWritableObservable = O.isWritableObservable
  isComputed = O.isComputed
  isPureComputed = O.isPureComputed

  _extenders: Record<string, Extender> | undefined
  _mapping: Record<string, any> | undefined

  get extenders(): Record<string, Extender> {
    if (!this._extenders) {
      throw new Error('Extenders module has not been added.')
    }
    return this._extenders
  }

  get mapping(): Record<string, any> {
    if (!this._extenders) {
      throw new Error('Mapping module has not been added.')
    }
    return this._extenders
  }

  use(module: VueKnockoutModule) {
    this[`_${module.name}`] = module.init()
  }
}

export default new VueKnockout()
