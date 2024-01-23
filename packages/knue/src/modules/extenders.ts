// /* eslint-disable @typescript-eslint/no-misused-new, @typescript-eslint/prefer-function-type, @typescript-eslint/no-unused-vars */
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
  E extends Extenders,
  P extends Record<string, any>
> = LastArrayElement<Entries<P>>[0] extends keyof E
  ? ReturnType<E[LastArrayElement<Entries<P>>[0]]>
  : never

export type Extender<
  T extends O.Subscribable<any>,
  O,
  R extends O.Subscribable<any>
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

    obj.observable[O.EXTENDERS_KEY].push({
      extend(this: O.Subscribable<any>, props: ExtendProps) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let returnVal: any = this
        for (const [key, value] of Object.entries(props)) {
          if (extensions && extensions[key]) {
            returnVal = extensions[key](this, value)
          }
        }
        return returnVal
      }
    })
    return obj as Augmentation<typeof O, {
      $subscribable: {
        extend<P extends ExtendProps>(props: P): ExtendReturn<E, P>
      }
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
