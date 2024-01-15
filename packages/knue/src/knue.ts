/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as O from 'vue-observables'

export interface Subscribable<T> extends O.Subscribable<T> {}
export type Observable<T, Opts> = ExtendSubscribable<O.Observable<T>, Opts>
export interface ObservableArray<T> extends O.ObservableArray<T> {}
export interface Computed<T> extends O.Computed<T> {}

// export type Extender<T extends O.Subscribable<any> = any, O = any> = (target: T, options: O) => T

// export type AllModules = 'extenders' | 'mapping'

export interface KnueModule {
  name: string
  init(obj: KnueType<KnueOptions>): KnueType<KnueOptions>
  __impl: Record<string, any>
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

type ExtendProps<Opts> =
  Opts extends { extenders: Extenders }
    ? {
        [K in keyof Opts['extenders']]: Parameters<Opts['extenders'][K]>[1]
      }
    : never

type SubscribableFn = (...args: any[]) => Subscribable<any>

// type ExtendSubscribable<T extends SubscribableFn, Opts> =
//   Opts extends KnueOptions
//     ? {
//       [K in keyof T]: T[K] &
//     }
//     : T
//       /** Extenders are enabled */
//       : Opts extends { extenders: Extenders }
//         ? T & {
//           extend<P extends ExtendProps<Opts>>(props: P): ExtendReturn<P>
//         }
//         : T
//     : T

// type ExtendReturn<
//   P extends ExtendProps<any>,
//   K extends keyof P = keyof P
// > =
//   Opts['extenders'] extends Extenders
//     ? K extends keyof Opts['extenders']
//       ? ReturnType<Opts['extenders'][K]>
//       : never
//     : never

// type GetReturn<
//   T extends Record<string, any>,
//   Opts extends KnueOptions
// > = Opts extends Record<string, any>
//   ? T & {
//     [K in keyof Required<Opts[string]['__impl']>]: Required<Opts[string]['__impl']>[K]
//   }
//   : T

type GetReturn<
  T extends Record<string, any>,
  Opts extends KnueOptions,
  ModKey extends keyof Opts = keyof Opts,
  OptsKey extends keyof Opts[ModKey]['__impl'] = keyof Opts[ModKey]['__impl']
>
  = Opts extends KnueOptions
    ? {
        [K in OptsKey]: Opts[ModKey]['__impl'][K]
      }
    : T

type KnueType<Opts extends KnueOptions> = ReturnType<typeof Knue<Opts>>

function Knue<Opts extends KnueOptions>(opts?: Opts) {
  // observable = O.observable
  // observableArray = O.observableArray
  // computed = O.computed
  // pureComputed = O.pureComputed
  // isObservable = O.isObservable
  // isWritableObservable = O.isWritableObservable
  // isComputed = O.isComputed
  // isPureComputed = O.isPureComputed

  let returnVal = O
  if (opts) {
    for (const module of Object.values(opts)) {
      // returnVal[key] = value
      // const module = opts[key]
      returnVal = module.init(returnVal)
    }
  }
  return returnVal as GetReturn<typeof returnVal, Opts>
}

const VueKnockout = Knue as unknown as {
  <Opts extends KnueOptions>(opts?: Opts): KnueType<Opts>
  new<Opts extends KnueOptions>(opts?: Opts): KnueType<Opts>
}

export { VueKnockout as Knue }

// const foo = new VueKnockout({ extenders: { foo: () => {} } })

// export default VueKnockout()
