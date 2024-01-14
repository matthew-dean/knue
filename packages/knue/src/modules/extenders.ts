import {
  Knue,
  type Subscribable,
  type KnueOptions
} from '../knue'

declare module '../knue' {
  // interface Knue<Opts extends KnueOptions> {
  //   observable: typeof O.observable
  //   observableArray: typeof O.observableArray
  //   computed: typeof O.computed
  //   pureComputed: typeof O.pureComputed
  //   isObservable: typeof O.isObservable
  //   isWritableObservable: typeof O.isWritableObservable
  //   isComputed: typeof O.isComputed
  //   isPureComputed: typeof O.isPureComputed
  // }
  interface Subscribable<T> {
    foo: string
  }
  // interface Knue<Opts extends KnueOptions> {
  //   observable: Knue<Opts>['observable'] & { foo: string }
  // }
}

const existingConstructor = Knue.prototype.constructor
Knue.prototype.constructor = <Opts extends KnueOptions>(opts?: Opts) => {
  const returnVal = existingConstructor(opts)
}
