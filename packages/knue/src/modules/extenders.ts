// /* eslint-disable @typescript-eslint/no-misused-new, @typescript-eslint/prefer-function-type, @typescript-eslint/no-unused-vars */
// import {
//   Knue,
//   // type Subscribable,
//   type KnueOptions
// } from '../knue'

import {
  type KnueModule
} from '../knue'
import { type Observable } from 'vue-observables'

export interface ExtendersModule extends KnueModule {
  __impl: {
    observable: {
      <T>(): Observable<T> & string
      <T>(value: T): Observable<T>
    }
  }
}

export const extenders = {
  name: 'extenders',
  init(obj) {
    return obj
  }
} as ExtendersModule

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
