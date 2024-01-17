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
import * as O from 'vue-observables'
import type {
  Entries,
  LastArrayElement
} from 'type-fest'

export type ForceWidening<T> = T extends string
  ? string
  : never | T extends number
    ? number
    : never | T extends bigint
      ? bigint
      : never | T extends boolean
        ? boolean
        : never | T extends any[]
          ? T extends [infer Head, ...infer Tail]
            ? [ForceWidening<Head>, ...ForceWidening<Tail>]
            : []
          :
            | never
            | {
              [K in keyof T]: T[K] extends Function ? T[K] : ForceWidening<T[K]>;
            }
export declare const lambda: unique symbol

/**
 * Declares basic lambda function with an unique symbol
 * to force other interfaces extending from this type
 */
export interface Lambda<Args = unknown, Return = unknown> {
  args: Args
  return: Return
  [lambda]: never
}

/**
 * Composes two Lambda type functions and returns a new lambda function
 * JS-equivalent:
 *  const compose = (a,b) => (arg) => a(b(arg))
 *
 */
export interface Compose<
  A extends Lambda<ForceWidening<Return<B>>>,
  B extends Lambda<any, Args<A>>,
  I extends Args<B> = Args<B>,
> extends Lambda {
  args: I
  intermediate: Call<B, Args<this>>
  return: this['intermediate'] extends Args<A>
    ? Call<A, this['intermediate']>
    : never
}

export interface EmptyLambda extends Lambda {}
/**
 * Gets return type value from a Lambda type function
 */
export type Call<M extends Lambda, T extends Args<M>> = (M & {
  args: T
})['return']
/**
 * Extracts the argument from a lambda function
 */
export type Args<M extends Lambda> = M['args']

export type Return<M extends Lambda> = M['return']

export type Primitve = string | number | bigint | boolean | null | undefined

// declare module '../types' {
//   interface Observable<T> {
//     extend<P extends Record<string, any>>(props: P): ExtendReturn<Observable<T>, any, P>
//   }
// }

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

// export type Extensions<T extends Extenders> = ReturnType<KnuePlugin> & T
/**
 * @param extensions
 *  e.g. {
 *     numericText: (target: Subscribable<any>, data?: any) => {
 *     }
 *  }
 */
type ExtendReturn<
  S extends O.Subscribable<any>,
  E extends Extenders,
  P extends Record<string, any>,
  Last extends LastArrayElement<Entries<P>> = LastArrayElement<Entries<P>>
> = Last[0] extends keyof E
  ? Last[1] extends Extender<any, infer O, infer R> ? Extender<S, O, R> : false
  : never

interface Extender extends Lambda<> {

}

export type Extender<
  T extends O.Subscribable<any> = O.Subscribable<any>,
  O = any,
  R extends O.Subscribable<any> = T
>
  = (target: T, options: O) => R

export type Extenders<
  T extends Record<string, Extender<any, any, any>> = Record<string, Extender<any, any, any>>
> = T

export const extenders = (<E extends Extenders>(
  extensions?: E
) => ({
  name: 'extenders',
  init(obj: typeof O) {
    type ExtendProps = {
      [K in keyof E]: Parameters<E[K]>[1]
    }

    const extend = <
      S extends O.Subscribable<any>
    >(
        props: ExtendProps
      ): ExtendReturn<S, E, ExtendProps> => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let returnVal: any = this
      for (const [key, value] of Object.entries(props)) {
        if (extensions && extensions[key]) {
          returnVal = extensions[key](this, value)
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

// declare module '../knue' {
//   interface Subscribable<T> {
//     foo: string
//   }
//   interface Observable<T> extends Subscribable<T> {}

//   interface Knue<Opts extends KnueOptions> {
//     new(opts?: Opts): Knue<Opts>
//   }
// }

// (function() {
//   const existingConstructor = Knue.prototype.constructor
//   Knue.prototype.constructor = <Opts extends KnueOptions>(opts?: Opts) => {
//     const returnVal = existingConstructor(opts)
//   }
// })()
