// /* eslint-disable @typescript-eslint/no-misused-new, @typescript-eslint/prefer-function-type, @typescript-eslint/no-unused-vars */
// import {
//   Knue,
//   // type Subscribable,
//   type KnueOptions
// } from '../knue'

import {
  type KnuePlugin,
  type Extenders
} from '../knue'
import {
  type Observable,
  type Subscribable,
  EXTENDERS_KEY
} from 'vue-observables'

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

export type ExtendersModule = KnuePlugin

export type Extensions<T extends Extenders> = ReturnType<KnuePlugin> & T
/**
 * @param extensions
 *  e.g. {
 *     numericText: (target: Subscribable<any>, data?: any) => {
 *     }
 *  }
 */
export const extenders: ExtendersModule = <E extends Extenders>(
  extensions?: E
) => ({
    name: 'extenders',
    init(obj) {
      obj.observable[EXTENDERS_KEY].push({
        extend(this: Subscribable<any>, props: Record<string, any>) {
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
      return obj
    }
  }) as Extensions<E>

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
