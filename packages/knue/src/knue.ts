/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as O from 'vue-observables'

export interface Subscribable<T> extends O.Subscribable<T> {}
export interface Observable<T> extends O.Observable<T> {}
export interface ObservableArray<T> extends O.ObservableArray<T> {}
export interface Computed<T> extends O.Computed<T> {}

// export type Extender<T extends O.Subscribable<any> = any, O = any> = (target: T, options: O) => T

// export type AllModules = 'extenders' | 'mapping'

export interface KnueModule<T extends Record<string, any> = Record<string, any>> {
  name: string
  init(): T
}

// export interface ExtendSubscribable<T> {
//   extend(props: Record<string, any>): T
// }

// export interface Subscribable<T> extends O.Subscribable<T> {}

export type Extender<
  T extends Subscribable<any>,
  O,
  R extends Subscribable<any>
>
  = (target: T, options: O) => R

export type Extenders = Record<string, Extender<any, any, any>>
export type KnueOptions = Record<string, KnueModule>
type KnueType<Opts extends KnueOptions> = Knue<Opts>

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class Knue<Opts extends KnueOptions> {
  observable = O.observable
  observableArray = O.observableArray
  computed = O.computed
  pureComputed = O.pureComputed
  isObservable = O.isObservable
  isWritableObservable = O.isWritableObservable
  isComputed = O.isComputed
  isPureComputed = O.isPureComputed

  constructor(opts?: Opts) {
    // type ExtendReturn =
    type ExtendProps =
      Opts extends { extenders: Extenders }
        ? {
            [K in keyof Opts['extenders']]: Parameters<Opts['extenders'][K]>[1]
          }
        : never

    type ExtendReturn<
      P extends ExtendProps,
      K extends keyof P = keyof P
    > =
      Opts['extenders'] extends Extenders
        ? K extends keyof Opts['extenders']
          ? ReturnType<Opts['extenders'][K]>
          : never
        : never

    type ExtendSubscribable<T> =
      T extends Subscribable<any>
        ? T extends { extend: (...args: any[]) => any }
          /** already extended */
          ? T
          /** Extenders are enabled */
          : Opts extends { extenders: Extenders }
            ? T & {
              extend<P extends ExtendProps>(props: P): ExtendReturn<P>
            }
            : T
        : T

    type Exports = {
      [K in keyof typeof observables]: ExtendSubscribable<typeof observables[K]>
    }

    // function observable<T>(): Observable<T | undefined>
    // function observable<T>(value: T): Observable<T>
    // function observable<T>(value?: T) {
    //   return arguments.length === 0 ? observables.observable<T>() : observables.observable<T>(value!)
    //   // return attachExtend(arguments.length === 0 ? O.observable<T>() : O.observable<T>(value!))
    // }
    const obs = { ...O } as Exports

    // if (opts.extenders) {
    //   function observable<T>(): Observable<T | undefined>
    //   function observable<T>(value: T): Observable<T>
    //   function observable<T>(value?: T) {
    //     return arguments.length === 0 ? observables.observable<T>() : observables.observable<T>(value!)
    //     // return attachExtend(arguments.length === 0 ? O.observable<T>() : O.observable<T>(value!))
    //   }
    //   obs.observable = observable
    // }

    return O
  }
}

// const foo = new VueKnockout({ extenders: { foo: () => {} } })

// export default VueKnockout()
