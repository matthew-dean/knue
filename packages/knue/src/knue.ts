/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as O from 'vue-observables'
import { type ComputedGetter, type DebuggerOptions } from 'vue'
import type {
  Type,
  Checked,
  apply
} from 'free-types/core'

export interface Subscribable<T> extends O.Subscribable<T> {}
// export type Observable<T, Opts> = ExtendSubscribable<O.Observable<T>, Opts>
export interface ObservableArray<T> extends O.ObservableArray<T> {}
export interface Computed<T> extends O.Computed<T> {}

// export type Extender<T extends O.Subscribable<any> = any, O = any> = (target: T, options: O) => T

// export type AllModules = 'extenders' | 'mapping'

type Subscribables = 'observable' | 'observableArray' | 'computed' | 'pureComputed'

export type Extender<
  T extends Subscribable<any>,
  O,
  R extends Subscribable<any>
>
  = (target: T, options: O) => R
export type Extenders<
  T extends Record<string, Extender<any, any, any>> = Record<string, Extender<any, any, any>>
> = T

type ExtendProps<Opts> =
  Opts extends { extenders: Extenders }
    ? {
        [K in keyof Opts['extenders']]: Parameters<Opts['extenders'][K]>[1]
      }
    : never

type ExtendReturn<
  Opts extends KnuePlugins,
  P extends ExtendProps<Opts>,
  PropKey extends keyof P = keyof P
> = Opts extends { extenders: Extenders }
  ? PropKey extends keyof Opts['extenders']
    ? {
        [K in keyof Opts['extenders']]: ReturnType<Opts['extenders'][PropKey]>
      }
    : never
  : never

type ConstuctExtendersForObservable<
  Plugins extends KnuePlugins
> = Opts extends { extenders: Extenders }
  ? {
      extend<P extends ExtendProps<Opts>>(props: P): ExtendReturn<Opts, P>
    }
  : unknown

type Names<T> = {
  [K in keyof T]: K extends 'name' ? K : never
}[keyof T]

type ArrayToKeyObject<T = any>
  = T extends Array<infer U>
    ? {
        [K in Names<U>]: K
      }
    : never

type MappedPlugins<
  Plugins extends KnuePlugins,
  PluginIndicies extends Indicies<Plugins> = Indicies<Plugins>
> = PluginIndicies extends number ? {
  [K in keyof PluginIndicies as `${Plugins[K]['name']}`]: Plugins[K]['name'] extends 'extenders' ? never : Plugins[K]
} : never

type ConstructImplementation<
  Return extends { [K in Subscribables]: any },
  Plugins extends KnuePlugins,
  PluginsNoExtenders extends RemoveExtendersPlugin<Plugins> = RemoveExtendersPlugin<Plugins>,
  // PKey extends Plugins[number]['name'] = Plugins[number]['name'],
  Impl extends PluginsNoExtenders[number]['__impl'] = PluginsNoExtenders[number]['__impl'],
  // Opts extends TypedOpts<UnTypedOpts> = TypedOpts<UnTypedOpts>,
  // ModKey extends Exclude<keyof Opts, 'extenders'> = Exclude<keyof Opts, 'extenders'>,
  // Impl extends Opts[ModKey]['__impl'] = Opts[ModKey]['__impl']
> = {
  observable: 'observable' extends keyof Impl
    ? {
      <T>(): O.Observable<T | undefined> & ConstuctExtendersForObservable<Plugins>
      <T>(value: T): O.Observable<T> & ConstuctExtendersForObservable<Plugins>
      }
    : Return['observable']
  observableArray: 'observableArray' extends keyof Impl
    ? <T>(value?: T[]) => O.ObservableArray<T> & Impl['observableArray'] & ConstuctExtendersForObservable<Plugins>
    : Return['observableArray']
  computed: 'computed' extends keyof Impl
    ? <T>(getter: ComputedGetter<T> | O.WriteableOptions<T>, debugOptions?: DebuggerOptions)
  => (O.Computed<T> | O.WritableComputed<T>) & Impl['computed']
    : Return['computed']
  pureComputed: 'pureComputed' extends keyof Impl
    ? <T>(getter: ComputedGetter<T> | O.WriteableOptions<T>, debugOptions?: DebuggerOptions)
  => (O.Computed<T> | O.WritableComputed<T>) & Impl['pureComputed']
    : Return['pureComputed']
} & Omit<Impl, Subscribables>

interface One<T extends Record<string, any>> {
  type: T
}

interface NewOne<T extends Record<string, any>> extends One<T> {

}

interface $Plugin extends Type<[KnuePlugin]> {
  type: this[0]
}

type Foo<P extends KnuePlugin> = apply<$Plugin, [P]>
// console.log(foo)

export type KnuePlugin<
  Impl extends Record<string, unknown> = Record<string, unknown>,
  PluginOptions extends Record<string, any> = Record<string, any>,
  R extends typeof O = typeof O
> = (opts?: PluginOptions) => {
  name: string
  init(obj: R): R
  /**
     * Modules must redefine the implementation of
     * all the methods they override.
     */
  __impl?: Impl
}

// export interface ExtendSubscribable<T> {
//   extend(props: Record<string, any>): T
// }

// export interface Subscribable<T> extends O.Subscribable<T> {}

export type KnuePlugins = Array<ReturnType<KnuePlugin>>

// type SubscribableFn = (...args: any[]) => Subscribable<any>

// interface ObservableFn<T, U = unknown> {
//   (value: T): O.Observable<T> & U
//   (): O.Observable<T | undefined> & U
// }

// type ExtendSubscribable<T extends SubscribableFn, Opts> =
//   Opts extends KnuePlugins
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
//   Opts extends KnuePlugins
// > = Opts extends Record<string, any>
//   ? T & {
//     [K in keyof Required<Opts[string]['__impl']>]: Required<Opts[string]['__impl']>[K]
//   }
//   : T

// [K in OptsKey]: Opts[ModKey]['__impl'][K]

type GetReturn<
  T extends { [K in Subscribables]: any },
  Plugins extends KnuePlugins
>
  = Plugins extends KnuePlugins
    ? ConstructImplementation<T, {
      [K in keyof Plugins]: Required<Plugins[K]>
    }>
    : T

type KnueType<Opts extends KnuePlugins> = ReturnType<typeof Knue<Opts>>

function Knue<Plugins extends KnuePlugins>(plugins?: Plugins) {
  // observable = O.observable
  // observableArray = O.observableArray
  // computed = O.computed
  // pureComputed = O.pureComputed
  // isObservable = O.isObservable
  // isWritableObservable = O.isWritableObservable
  // isComputed = O.isComputed
  // isPureComputed = O.isPureComputed

  let returnVal = O
  if (plugins) {
    for (const plugin of plugins) {
      // returnVal[key] = value
      // const module = opts[key]
      returnVal = plugin.init(returnVal)
    }
  }
  return returnVal as GetReturn<typeof returnVal, Plugins>
}

const VueKnockout = Knue as unknown as {
  <Opts extends KnuePlugins>(opts?: Opts): KnueType<Opts>
  new<Opts extends KnuePlugins>(opts?: Opts): KnueType<Opts>
}

export { VueKnockout as Knue }

// const foo = new VueKnockout({ extenders: { foo: () => {} } })

// export default VueKnockout()
