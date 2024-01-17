/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type * as O from 'vue-observables'
import { type ComputedGetter, type DebuggerOptions } from 'vue'
import type {
  RequireAtLeastOne
} from 'type-fest'
import type { KnueType } from './knue'

type Subscribables = 'observable' | 'observableArray' | 'computed' | 'pureComputed'

export interface Observable<T> extends O.Observable<T> {}

// type ExtendProps<Opts> =
//   Opts extends { extenders: Extenders }
//     ? {
//         [K in keyof Opts['extenders']]: Parameters<Opts['extenders'][K]>[1]
//       }
//     : never

// type ConstuctExtendersForObservable<
//   Plugins extends KnuePlugins
// > = Plugins extends { extenders: Extenders }
//   ? {
//       extend<P extends ExtendProps<Plugins>>(props: P): ExtendReturn<Plugins, P>
//     }
//   : unknown

// type Names<T> = {
//   [K in keyof T]: K extends 'name' ? K : never
// }[keyof T]

// type ArrayToKeyObject<T = any>
//   = T extends Array<infer U>
//     ? {
//         [K in Names<U>]: K
//       }
//     : never

// type MappedPlugins<
//   Plugins extends KnuePlugins,
//   PluginIndicies extends Indicies<Plugins> = Indicies<Plugins>
// > = PluginIndicies extends number ? {
//   [K in keyof PluginIndicies as `${Plugins[K]['name']}`]: Plugins[K]['name'] extends 'extenders' ? never : Plugins[K]
// } : never

// type ConstructImplementation<
//   Return extends { [K in Subscribables]: any },
//   Plugins extends KnuePlugins,
//   PluginsNoExtenders extends RemoveExtendersPlugin<Plugins> = RemoveExtendersPlugin<Plugins>,
//   // PKey extends Plugins[number]['name'] = Plugins[number]['name'],
//   Impl extends PluginsNoExtenders[number]['__impl'] = PluginsNoExtenders[number]['__impl'],
//   // Opts extends TypedOpts<UnTypedOpts> = TypedOpts<UnTypedOpts>,
//   // ModKey extends Exclude<keyof Opts, 'extenders'> = Exclude<keyof Opts, 'extenders'>,
//   // Impl extends Opts[ModKey]['__impl'] = Opts[ModKey]['__impl']
// > = {
//   observable: 'observable' extends keyof Impl
//     ? {
//       <T>(): O.Observable<T | undefined> & ConstuctExtendersForObservable<Plugins>
//       <T>(value: T): O.Observable<T> & ConstuctExtendersForObservable<Plugins>
//       }
//     : Return['observable']
//   observableArray: 'observableArray' extends keyof Impl
//     ? <T>(value?: T[]) => O.ObservableArray<T> & Impl['observableArray'] & ConstuctExtendersForObservable<Plugins>
//     : Return['observableArray']
//   computed: 'computed' extends keyof Impl
//     ? <T>(getter: ComputedGetter<T> | O.WriteableOptions<T>, debugOptions?: DebuggerOptions)
//   => (O.Computed<T> | O.WritableComputed<T>) & Impl['computed']
//     : Return['computed']
//   pureComputed: 'pureComputed' extends keyof Impl
//     ? <T>(getter: ComputedGetter<T> | O.WriteableOptions<T>, debugOptions?: DebuggerOptions)
//   => (O.Computed<T> | O.WritableComputed<T>) & Impl['pureComputed']
//     : Return['pureComputed']
// } & Omit<Impl, Subscribables>

type GetAugmentations<
  Augmentations extends Array<typeof O>
> = {
  [K in keyof Augmentations]:
  Augmentations[K] extends Augmentation<typeof O, infer A>
    ? {
        'observable': A extends { $subscribable: any }
          ? A['$subscribable']
          : A extends { observable: any } ? A['observable'] : unknown
        'computed': A extends { $subscribable: any }
          ? A['$subscribable']
          : A extends { computed: any } ? A['computed'] : unknown
      }
    : {
        'observable': unknown
        'computed': unknown
      }
}

type GetReturnTypes<
  Plugins extends KnuePlugins
> = {
  [K in keyof Plugins]: ReturnType<Plugins[K]['init']>
}

type ConstructImplementation<
  Plugins extends KnuePlugins,
  ReturnTypes extends GetReturnTypes<Plugins> = GetReturnTypes<Plugins>,
  Augmentations extends GetAugmentations<ReturnTypes> = GetAugmentations<ReturnTypes>
> = {
  observable: {
    <T>(): Observable<T | undefined>
    <T>(value: T): Observable<T>
  }
  observableArray: typeof O.observableArray & Augmentations[number]['observable']
  computed: typeof O.computed & Augmentations[number]['computed']
  pureComputed: typeof O.pureComputed & Augmentations[number]['computed']
} // & Omit<ReturnTypes, Subscribables>

export type GetReturn<
  T extends { [K in Subscribables]: any },
  Plugins extends KnuePlugins
>
  = Plugins extends KnuePlugins
    ? ConstructImplementation<Plugins>
    : T

export type KnuePlugins = Array<ReturnType<KnuePlugin>>

export type KnuePlugin<
  PluginOptions extends Record<string, any> = Record<string, any>,
  R extends typeof O = typeof O
> = (opts?: PluginOptions) => {
  name: string
  /** Initialization function can mutate and return the ko namespace */
  init(obj: R): R
}

export type KnuePluginRecord<Plugins extends KnuePlugins> = {
  [K in keyof Plugins as `${Plugins[number]['name']}`]: Plugins[K]
}

type foo = KnuePluginRecord<[
  {
    name: 'extenders'
    init: (obj: typeof O) => typeof O
  }
]>

export type AugmentObject = {
  $subscribable: any
} | RequireAtLeastOne<{
  observable?: any
  computed?: any
}, 'observable' | 'computed'>

export type Augmentation<
  O extends typeof O = typeof O,
  T extends AugmentObject = AugmentObject
> = O & T

export interface KnueConstructor {
  <Plugins extends KnuePlugins>(opts?: Plugins): KnueType<Plugins>
  new<Plugins extends KnuePlugins>(opts?: Plugins): KnueType<Plugins>
}
