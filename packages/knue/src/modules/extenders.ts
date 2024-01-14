import {
  Knue
} from '../knue'
import { type Subscribable } from 'vue-observables'

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
  interface Knue<Opts extends KnueOptions> {
    observable: Knue<Opts>['observable'] & { foo: string }
  }
}
Knue.prototype.constructor = () => {}
