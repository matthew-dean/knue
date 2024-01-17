/* eslint-disable @typescript-eslint/no-misused-new, @typescript-eslint/prefer-function-type, @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types */
// import {
//   Knue,
//   // type Subscribable,
//   type KnueOptions
// } from '../knue'

import type {
  KnuePlugin,
  Augmentation
} from '../types'
import type { KnueType } from '../knue'
import * as O from 'vue-observables'
import type {
  Entries,
  LastArrayElement
} from 'type-fest'

export type Extender<
  T extends O.Subscribable<any> = O.Subscribable<any>,
  O = any,
  R extends O.Subscribable<any> = T
>
  = (target: T, options: O) => R

export type Extenders<
  T extends Record<string, Extender<any, any, any>> = Record<string, Extender<any, any, any>>
> = T

type ExtendReturn<
  S extends O.Subscribable<any>,
  E extends Extenders,
  P extends {
    [K in keyof E]: Parameters<E[K]>[1]
  }
> = LastArrayElement<Entries<P>>[1] extends Extender<S, any, infer R> ? R : never

export const extenders = (<const E extends Extenders>(
  extensions: E
) => ({
  name: 'extenders',
  init(obj: typeof O) {
    type ExtendProps = {
      [K in keyof E]: Parameters<E[K]>[1]
    }

    const extend = <
      S extends O.Subscribable<any>,
      P extends ExtendProps
    >(
        props: P
      ) => {
      const propEntries = Object.entries(props) as Entries<P>
      let last: Pick<P, LastArrayElement<Entries<P>>[0]>
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let returnVal = extensions[last[0]](this, last[1])
      for (const [key, value] of Object.entries(props)) {
        if (extensions && extensions[key]) {
          const extender = extensions[key]
          returnVal = extender(this, value)
        }
      }
      return returnVal
    }

    obj.observable[O.EXTENDERS_KEY].push({
      extend
    })
    return obj as Augmentation<typeof O, {

      observable: {
        <T>(): O.Observable<T | undefined> & {
          extend: typeof extend<O.Observable<T | undefined>>
        }
        <T>(value: T): O.Observable<T> & {
          extend: typeof extend<O.Observable<T>>
        }
      }

      // $subscribable: {
      //   extend<P extends ExtendProps>(props: P): ExtendReturn<E, P>
      // }
    }>
  }
}) as const) satisfies KnuePlugin

declare module '../types' {
  interface KnueExtenderType {
    observable: string
  }

  type GetType<Plugins extends KnuePlugins> =
    Plugins[number]['name'] extends 'extenders'
      ? Omit<KnueType<Plugins>, keyof KnueExtenderType> & KnueExtenderType
      : KnueType<Plugins>

  interface KnueConstructor {
    <const Plugins extends KnuePlugins>(opts?: Plugins): GetType<Plugins>
    new<const Plugins extends KnuePlugins>(opts?: Plugins): GetType<Plugins>
  }
}

// (function() {
//   const existingConstructor = Knue.prototype.constructor
//   Knue.prototype.constructor = <Opts extends KnueOptions>(opts?: Opts) => {
//     const returnVal = existingConstructor(opts)
//   }
// })()
